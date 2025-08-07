# backend/app/services/s3_service.py - FIXED VERSION

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
        self.region = os.getenv('AWS_S3_REGION', 'ap-south-1')
        
        # FIXED: Auto-generate S3 URL if not provided
        if os.getenv('AWS_S3_URL'):
            self.base_url = os.getenv('AWS_S3_URL')
        else:
            self.base_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com"
        
        print(f"🔧 S3 Config: Bucket={self.bucket_name}, Region={self.region}")
        print(f"🔧 S3 Base URL: {self.base_url}")
        
        if not all([self.access_key, self.secret_key, self.bucket_name]):
            print("❌ AWS credentials missing!")
            print(f"Access Key: {'✅' if self.access_key else '❌'}")
            print(f"Secret Key: {'✅' if self.secret_key else '❌'}")
            print(f"Bucket Name: {'✅' if self.bucket_name else '❌'}")
            raise ValueError("AWS credentials not properly configured")
        
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region
            )
            
            # Test S3 connection
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            print(f"✅ S3 Client initialized and bucket '{self.bucket_name}' accessible")
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                raise ValueError(f"S3 bucket '{self.bucket_name}' not found")
            elif error_code == '403':
                raise ValueError(f"Access denied to S3 bucket '{self.bucket_name}'")
            else:
                raise ValueError(f"S3 connection failed: {e}")
        except NoCredentialsError:
            raise ValueError("AWS credentials not found or invalid")
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
                detail="File type not allowed. Use JPEG, PNG, WebP, or GIF"
            )
        
        return {
            'content_type': content_type,
            'file_size': file_size
        }

    def _optimize_image(self, file_content: bytes, max_width: int = 1200, max_height: int = 1200) -> bytes:
        """Optimize image for web"""
        try:
            image = Image.open(io.BytesIO(file_content))
            
            # Fix orientation
            image = ImageOps.exif_transpose(image)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Resize if too large
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85, optimize=True)
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
            
            # Upload to S3
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
            
            print(f"✅ Image uploaded: {s3_key} -> {file_url}")
            
            return {
                'success': True,
                'filename': s3_key.split('/')[-1],
                'original_filename': file.filename,
                'url': file_url,
                's3_key': s3_key,
                'size': len(file_content),
                'original_size': original_size,
                'content_type': validation['content_type'],
                'optimized': optimize
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"S3 upload error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    async def upload_avatar(
        self,
        file: UploadFile,
        user_id: int,
        max_size_mb: int = 2
    ) -> Dict[str, Any]:
        """Upload user avatar to S3"""
        result = await self.upload_image(
            file=file,
            folder="avatars",
            optimize=True,
            max_size_mb=max_size_mb,
            max_width=400,
            max_height=400
        )
        
        result['avatar_url'] = result['url']
        return result

    def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            print(f"✅ File deleted from S3: {s3_key}")
            return True
        except Exception as e:
            print(f"❌ Failed to delete file {s3_key}: {e}")
            return False


# Global S3 service instance
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