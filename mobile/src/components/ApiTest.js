// mobile/src/components/ApiTest.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { checkAPIConnectivity } from '../services/api';

const ApiTest = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const connected = await checkAPIConnectivity();
      setIsConnected(connected);
      
      if (connected) {
        Alert.alert('Success', 'Backend API is connected and working!');
      } else {
        Alert.alert('Error', 'Cannot connect to backend. Check if server is running.');
      }
    } catch (error) {
      setIsConnected(false);
      Alert.alert('Error', `Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testConnection();
  }, []);

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>API Connection Test</Text>
      
      <View style={{ 
        padding: 10, 
        borderRadius: 8, 
        backgroundColor: isConnected === true ? '#d4edda' : isConnected === false ? '#f8d7da' : '#fff3cd',
        marginBottom: 20 
      }}>
        <Text style={{ 
          color: isConnected === true ? '#155724' : isConnected === false ? '#721c24' : '#856404',
          textAlign: 'center' 
        }}>
          Status: {isConnected === true ? '✅ Connected' : isConnected === false ? '❌ Disconnected' : '⏳ Testing...'}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={testConnection}
        disabled={loading}
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 8,
          minWidth: 150,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {loading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={{ marginTop: 20, fontSize: 12, color: '#666', textAlign: 'center' }}>
        Backend should be running on:{'\n'}
        http://192.168.1.10:8000
      </Text>
    </View>
  );
};

export default ApiTest;