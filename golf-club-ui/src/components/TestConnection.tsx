import { useState, useEffect } from 'react';
import { config } from '../config';

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing connection to:', `${config.API_URL}/api/test-connection`);
        const response = await fetch(`${config.API_URL}/api/test-connection`);
        const data = await response.json();
        setStatus(`Connected! Environment: ${data.environment}`);
      } catch (error) {
        setStatus(`Error: ${error}`);
        console.error('Connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h3>API Connection Status:</h3>
      <pre>{status}</pre>
      <p>API URL: {config.API_URL}</p>
    </div>
  );
}; 