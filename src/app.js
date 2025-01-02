import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [state, setState] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/clubs/`, {
        params: { state },
      });
      setClubs(response.data);
    } catch (error) {
      setError('Error fetching clubs. Please check the state code and try again.');
      console.error('Error fetching clubs:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Golf Club Query</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Enter State (e.g., MI): 
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <button onClick={fetchClubs} style={{ marginLeft: '10px' }}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && clubs.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Club ID</th>
              <th>Club Name</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.club_id}>
                <td>{club.club_id}</td>
                <td>{club.club_name}</td>
                <td>{club.city}</td>
                <td>{club.state}</td>
                <td>{club.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && clubs.length === 0 && !error && <p>No clubs found.</p>}
    </div>
  );
}

export default App;
