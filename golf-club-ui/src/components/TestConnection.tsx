import React, { useEffect, useState } from 'react';
import { config } from '../config';

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/test`);
        const data = await response.json();
        setStatus(`API Connected: ${data.message}`);
      } catch (error) {
        setStatus(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, padding: 10, background: '#f0f0f0', borderRadius: 5 }}>
      {status}
    </div>
  );
}; 