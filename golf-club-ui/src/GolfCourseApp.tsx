import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Define the type for a single result
interface GolfCourse {
  club_name: string;
  course_name: string;
  city: string;
  state: string;
  distance_miles: number;
  price_range: string; // $, $$, $$$
  difficulty: string; // Easy, Medium, Hard
  technologies: string[]; // List of technologies offered
}

const technologyOptions = [
  'GPS',
  'Virtual Caddies',
  'Drone Rentals',
  'Mobile App Support',
  'Golf Simulators',
  'Drone Tracking',
  'Advanced GPS Mapping',
  'Live Leaderboards',
  'Smart Carts',
];

const GolfCourseApp: React.FC = () => {
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [priceRange, setPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [findTechnologies, setFindTechnologies] = useState<string[]>([]);
  const [results, setResults] = useState<GolfCourse[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [preferredPriceRange, setPreferredPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [recommendTechnologies, setRecommendTechnologies] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<GolfCourse[]>([]);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);

  const fetchCourses = async (page: number) => {
    try {
      const response = await axios.get<{ results: GolfCourse[]; total: number }>(
        'http://127.0.0.1:8000/find_courses/',
        {
          params: {
            zip_code: zipCode,
            radius,
            price_tier: priceRange,
            difficulty,
            technologies: findTechnologies.join(','),
            limit: 10,
            offset: (page - 1) * 10,
          },
        }
      );
      setResults(response.data.results);
      setTotalPages(Math.ceil(response.data.total / 10));
      setCourseError(null);
    } catch (err) {
      setCourseError('Failed to fetch golf courses.');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get<{ results: GolfCourse[] }>(
        'http://127.0.0.1:8000/get_recommendations/',
        {
          params: {
            zip_code: zipCode,
            radius,
            skill_level: skillLevel,
            preferred_price_range: preferredPriceRange,
            technologies: recommendTechnologies.join(','),
          },
        }
      );
      setRecommendations(response.data.results);
      setRecommendationError(null);
    } catch (err) {
      setRecommendationError('Failed to fetch recommendations.');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCourses(newPage);
  };

  const handleTechnologiesChange = (setTechnologies: React.Dispatch<React.SetStateAction<string[]>>) => {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
      setTechnologies(selectedOptions);
    };
  };

  return (
    <div className="container" style={{ width: '90%', margin: '10px auto' }}>
      <h1 style={{ textAlign: 'center', margin: '10px 0' }}>Golf Course Finder</h1>

      {/* Location Section */}
      <div className="location-section" style={{ marginBottom: '30px', textAlign: 'center', width: '45%', margin: '0 auto' }}>
        <h2>Location</h2>
        <div className="form-group">
          <label>
        ZIP Code:
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter ZIP code"
          style={{ marginLeft: '10px', width: '200px' }}
        />
          </label>
        </div>
        <div className="form-group">
          <label>
        Radius (miles):
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ marginLeft: '10px', width: '100px' }}
        >
          {[1, 5, 10, 25, 50, 100].map((r) => (
            <option key={r} value={r}>
          {r}
            </option>
          ))}
        </select>
          </label>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="two-column-layout" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Course Recommendation */}
        <div className="section" style={{ flex: '1', marginRight: '10px', minWidth: '300px' }}>
          <h2>Course Recommendation</h2>
          <div className="form-group">
            <label>
              Skill Level:
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                <option value="">Select Skill Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>
              Preferred Price Range:
              <select
                value={preferredPriceRange}
                onChange={(e) => setPreferredPriceRange(e.target.value as '' | '$' | '$$' | '$$$')}
              >
                <option value="">Select Price Range</option>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>Preferred Technologies:</label>
            <select
              multiple
              value={recommendTechnologies}
              onChange={handleTechnologiesChange(setRecommendTechnologies)}
              style={{ width: '100%', height: '100px' }}
            >
              {technologyOptions.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
          <button onClick={fetchRecommendations}>Get Recommendations</button>
          <ul className="results">
            {recommendations.map((rec, idx) => (
              <li key={idx}>
                {rec.club_name} - {rec.course_name}, {rec.city}, {rec.state} ({rec.distance_miles.toFixed(2)} miles)
              </li>
            ))}
          </ul>
        </div>

        {/* Find Courses */}
        <div className="section" style={{ flex: '1', marginLeft: '10px', minWidth: '300px' }}>
          <h2>Find Courses</h2>
          <div className="form-group">
            <label>
              Price Range:
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as '' | '$' | '$$' | '$$$')}
              >
                <option value="">All</option>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>
              Difficulty Level:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as '' | 'Easy' | 'Medium' | 'Hard')}
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>Technologies:</label>
            <select
              multiple
              value={findTechnologies}
              onChange={handleTechnologiesChange(setFindTechnologies)}
              style={{ width: '100%', height: '100px' }}
            >
              {technologyOptions.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => fetchCourses(1)}>Find Courses</button>
          <ul className="results" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {results.slice(0, 10).map((course, idx) => (
              <li key={idx}>
                {course.club_name} - {course.course_name}, {course.city}, {course.state} ({course.distance_miles.toFixed(2)} miles)
              </li>
            ))}
          </ul>
          {/* Pagination */}
          {results.length > 0 && (
            <div className="pagination" style={{ marginTop: '10px' }}>
              <button onClick={() => handlePageChange(1)} disabled={page === 1}>
                First
              </button>
              <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}>
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={page === pageNumber}
                >
                  {pageNumber}
                </button>
              ))}
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                Next
              </button>
              <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GolfCourseApp;
