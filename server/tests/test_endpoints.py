import requests
import logging
from dotenv import load_dotenv
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory containing test_endpoints.py
TEST_DIR = Path(__file__).resolve().parent
env_path = os.path.join(TEST_DIR, '.env')

# Load test environment variables
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
else:
    raise ValueError(f"Test .env file not found at {env_path}")

# Verify required variables
required_vars = [
    'API_URL',
    'TEST_TOKEN',
    'TEST_USER_EMAIL',
    'TEST_USER_ID',
    'TEST_ZIP'
]

missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

BASE_URL = os.getenv("API_URL", "http://localhost:8000")
TEST_TOKEN = os.getenv("TEST_TOKEN")  # Get from a test user in Supabase
TEST_ZIP = "48083"  # My area zip code

def test_golfer_profile():
    logger.info("Testing golfer profile endpoint...")
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    
    response = requests.get(
        f"{BASE_URL}/api/profiles/current",
        headers=headers
    )
    
    assert response.status_code == 200, f"Profile fetch failed: {response.text}"
    data = response.json()
    
    # Verify all required fields are present
    required_fields = [
        'preferred_price_range',
        'preferred_difficulty',
        'skill_level',
        'play_frequency',
        'number_of_holes',
        'club_membership',
        'driving_range',
        'putting_green',
        'chipping_green',
        'practice_bunker',
        'restaurant',
        'lodging_on_site',
        'motor_cart',
        'pull_cart',
        'golf_clubs_rental',
        'club_fitting',
        'golf_lessons'
    ]
    
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    logger.info("✓ Golfer profile test passed")

def test_recommendations():
    logger.info("Testing recommendations endpoint...")
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    
    params = {
        "zip_code": TEST_ZIP,
        "radius": 25
    }
    
    response = requests.get(
        f"{BASE_URL}/api/get_recommendations/",
        headers=headers,
        params=params
    )
    
    assert response.status_code == 200, f"Recommendations fetch failed: {response.text}"
    data = response.json()
    
    assert "courses" in data, "Missing courses in response"
    assert isinstance(data["courses"], list), "Courses should be a list"
    
    if len(data["courses"]) > 0:
        course = data["courses"][0]
        required_fields = [
            'id', 'name', 'distance_miles', 'price_tier',
            'difficulty', 'score', 'number_of_holes',
            'club_membership'
        ]
        for field in required_fields:
            assert field in course, f"Missing field in course: {field}"
    
    logger.info("✓ Recommendations test passed")

def test_find_clubs():
    logger.info("Testing find clubs endpoint...")
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    
    params = {
        "zip_code": TEST_ZIP,
        "radius": 25
    }
    
    response = requests.get(
        f"{BASE_URL}/api/find_clubs/",
        headers=headers,
        params=params
    )
    
    assert response.status_code == 200, f"Find clubs failed: {response.text}"
    data = response.json()
    
    assert "results" in data, "Missing results in response"
    assert isinstance(data["results"], list), "Results should be a list"
    
    logger.info("✓ Find clubs test passed")

if __name__ == "__main__":
    try:
        test_golfer_profile()
        test_recommendations()
        test_find_clubs()
        logger.info("All tests passed! ✓")
    except Exception as e:
        logger.error(f"Tests failed: {str(e)}") 