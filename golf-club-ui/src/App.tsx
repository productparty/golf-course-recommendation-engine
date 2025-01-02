import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS for styling

interface GolfClubCourse {
  club_id: string;
  club_name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  timestamp_updated: string;
  distance: number;
  course_id: string;
  course_name: string;
  num_holes: number;
  has_gps: boolean;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [zipCode, setZipCode] = useState<string>(''); // State for ZIP code input
  const [radius, setRadius] = useState<number>(10); // State for the radius dropdown
  const [results, setResults] = useState<GolfClubCourse[]>([]); // State for storing results
  const [error, setError] = useState<string | null>(null); // Error state

  const fetchClubs = async () => {
    setLoading(true); // Show loading indicator
    setError(null);
    try {
      console.log('Fetching clubs with ZIP code:', zipCode, 'and radius:', radius);
      // Fetch golf clubs using the ZIP code and radius
      const response = await axios.get('http://127.0.0.1:8000/search_by_zip/', {
        params: { zip_code: zipCode, radius },
      });
      console.log('Response data:', response.data);
      setResults(response.data as GolfClubCourse[]); // Update results state
    } catch (err) {
      setError('Failed to fetch results. Please check the ZIP code and try again.');
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Golf Course Finder</h1>

      {/* Input for ZIP Code */}
      <div className="form-group">
        <label>
          Enter ZIP Code:{' '}
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP code"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      {/* Dropdown for Radius */}
      <div className="form-group">
        <label>
          Select Radius (miles):{' '}
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {[1, 5, 10, 25, 100].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Search Button */}
      <button
        onClick={fetchClubs}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Search
      </button>

      {/* Loading Indicator */}
      {loading && <p>Loading...</p>}

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Results Display */}
      {!loading && results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Results</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                {result.club_name} - {result.course_name} - {result.city}, {result.state} ({result.distance.toFixed(2)} miles)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && zipCode && !error && (
        <p>No results found for this ZIP code and radius.</p>
      )}
    </div>
  );
};

export default App;
