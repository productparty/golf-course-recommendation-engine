import { useState, useEffect } from 'react';
import { config } from '../config';

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing API:', config.API_URL);
        const response = await fetch(`${config.API_URL}/api/test-connection`);
        const data = await response.json();
        setStatus(JSON.stringify(data, null, 2));
      } catch (err) {
        setError(String(err));
        console.error('Connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h3>API Connection Test</h3>
      <pre>Status: {status}</pre>
      {error && <pre style={{color: 'red'}}>Error: {error}</pre>}
      <pre>API URL: {config.API_URL}</pre>
    </div>
  );
}; 