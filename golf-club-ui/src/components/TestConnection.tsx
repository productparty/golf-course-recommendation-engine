import { useState, useEffect } from 'react';
import { config } from '../config';

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = ['/api/test', '/api/test-connection', '/api/health', '/api/debug'];
      const results = [];

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${config.API_URL}${endpoint}`);
          const response = await fetch(`${config.API_URL}${endpoint}`);
          const data = await response.json();
          results.push({ endpoint, status: response.status, data });
        } catch (error) {
          results.push({ endpoint, error: String(error) });
        }
      }

      setDebugInfo(results);
      setStatus('Tests completed');
    };

    testEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>API Connection Tests:</h3>
      <pre>{status}</pre>
      {debugInfo && (
        <div>
          <h4>Results:</h4>
          {debugInfo.map((result: any, index: number) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{result.endpoint}:</strong>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 