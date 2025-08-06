# backend/app/services/s3_service.py
"""
AWS S3 service for image uploads - Mumbai Region
Handles profile pictures and post images with Mumbai region optimization
"""

import boto3
import uuid
import os
from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException
from botocore.exceptions import ClientError, NoCredentialsError
from PIL import Image, ImageOps
import io
from datetime import datetime
import mimetypes


class S3Service:
    def __init__(self):
        """Initialize S3 client with Mumbai region"""
        self.access_key = os.getenv('AWS_ACCESS_KEY_ID')
        self.secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
        self.region = os.getenv('AWS_S3_REGION', 'ap-south-1')  # Mumbai default
        self.base_url = os.getenv('AWS_S3_URL')
        
        if not all([self.access_key, self.secret_key, self.bucket_name]):
            raise ValueError("AWS credentials not properly configured")
        
        # Initialize S3 client for Mumbai region
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region
            )
            print(f"✅ S3 Client initialized for {self.region} region")
        except Exception as e:
            raise ValueError(f"Failed to initialize S3 client: {e}")
    
    def _generate_file_key(self, original_filename: str, folder: str = "images") -> str:
        """Generate unique S3 key for file"""
        extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{timestamp}_{unique_id}.{extension}"
        return f"{folder}/{filename}"
    
    def _validate_image(self, file: UploadFile, max_size_mb: int = 10) -> Dict[str, Any]:
        """Validate uploaded image file"""
        # Check file size
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {max_size_mb}MB"
            )
        
        # Check file type
        content_type = file.content_type
        if not content_type:
            content_type, _ = mimetypes.guess_type(file.filename)
        
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        
        if content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="File type not allowed. Allowed: JPEG, PNG, WebP, GIF"
            )
        
        return {
            'file_size': file_size,
            'content_type': content_type
        }
    
    def _optimize_image(self, file_content: bytes, max_width: int = 1200, max_height: int = 1200, quality: int = 85) -> bytes:
        """Optimize image for web with better compression"""
        try:
            image = Image.open(io.BytesIO(file_content))
            
            # Auto-rotate based on EXIF data
            image = ImageOps.exif_transpose(image)
            
            # Convert to RGB if needed
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Resize if necessary
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            return output.getvalue()
        
        except Exception as e:
            print(f"Image optimization failed: {e}")
            return file_content
    
    async def upload_image(
        self, 
        file: UploadFile, 
        folder: str = "images",
        optimize: bool = True,
        max_size_mb: int = 10,
        max_width: int = 1200,
        max_height: int = 1200
    ) -> Dict[str, Any]:
        """Upload image to S3 Mumbai region"""
        try:
            validation = self._validate_image(file, max_size_mb)
            
            file_content = await file.read()
            original_size = len(file_content)
            
            if optimize:
                file_content = self._optimize_image(file_content, max_width, max_height)
            
            s3_key = self._generate_file_key(file.filename, folder)
            
            # Upload to S3 Mumbai
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=validation['content_type'],
                ACL='public-read',
                CacheControl='max-age=31536000',
                Metadata={
                    'original-filename': file.filename,
                    'original-size': str(original_size),
                    'optimized-size': str(len(file_content)),
                    'upload-timestamp': datetime.now().isoformat(),
                    'region': self.region
                }
            )
            
            file_url = f"{self.base_url}/{s3_key}"
            
            return {
                'success': True,
                'filename': s3_key.split('/')[-1],
                'original_filename': file.filename,
                'url': file_url,
                'file_size': len(file_content),
                'original_size': original_size,
                'content_type': validation['content_type'],
                'is_image': True,
                's3_key': s3_key,
                'bucket': self.bucket_name,
                'region': self.region,
                'upload_time': datetime.now().isoformat()
            }
            
        except HTTPException:
            raise
        except ClientError as e:
            error_code = e.response['Error']['Code']
            raise HTTPException(status_code=500, detail=f"S3 error: {error_code}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    async def upload_multiple_images(self, files: list[UploadFile], folder: str = "images", max_files: int = 5) -> Dict[str, Any]:
        """Upload multiple images to S3"""
        if len(files) > max_files:
            raise HTTPException(status_code=400, detail=f"Maximum {max_files} files allowed")
        
        uploaded_files = []
        failed_files = []
        
        for file in files:
            try:
                result = await self.upload_image(file, folder)
                uploaded_files.append(result)
            except Exception as e:
                failed_files.append({
                    'filename': file.filename,
                    'error': str(e)
                })
        
        return {
            'success': len(failed_files) == 0,
            'uploaded_files': uploaded_files,
            'failed_files': failed_files,
            'total_files': len(files),
            'successful_uploads': len(uploaded_files),
            'failed_uploads': len(failed_files)
        }
    
    def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            return True
        except Exception as e:
            print(f"Failed to delete file {s3_key}: {e}")
            return False
    
    def get_file_info(self, s3_key: str) -> Optional[Dict[str, Any]]:
        """Get file information from S3"""
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return {
                'exists': True,
                'size': response['ContentLength'],
                'last_modified': response['LastModified'],
                'content_type': response['ContentType'],
                'metadata': response.get('Metadata', {})
            }
        except ClientError:
            return {'exists': False}


# Global S3 service instance (only created if credentials available)
try:
    s3_service = S3Service()
    S3_AVAILABLE = True
    print("✅ S3 Service initialized successfully")
except ValueError as e:
    s3_service = None
    S3_AVAILABLE = False
    print(f"⚠️ S3 Service not available: {e}")
except Exception as e:
    s3_service = None
    S3_AVAILABLE = False
    print(f"❌ S3 Service initialization failed: {e}")