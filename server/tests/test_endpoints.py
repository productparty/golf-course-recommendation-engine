import requests
import logging
import json
from dotenv import load_dotenv
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestSetup:
    def __init__(self):
        # Load environment variables
        self.load_env()
        self.token = None
        
    def load_env(self):
        env_path = Path(__file__).parent / '.env'
        if not env_path.exists():
            raise FileNotFoundError(f"Environment file not found at {env_path}")
        load_dotenv(env_path)
        
        # Verify required variables
        required_vars = ['API_URL', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD']
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
            
        self.api_url = os.getenv('API_URL')
        self.email = os.getenv('TEST_USER_EMAIL')
        self.password = os.getenv('TEST_USER_PASSWORD')

    def get_token(self):
        """Get a fresh token or use cached one"""
        try:
            response = requests.post(
                f"{self.api_url}/api/debug/token",
                json={
                    "email": self.email,
                    "password": self.password
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Token request failed: {response.text}")
                raise Exception(f"Failed to get token: {response.status_code}")
                
            data = response.json()
            self.token = data['access_token']
            return self.token
            
        except Exception as e:
            logger.error(f"Error getting token: {str(e)}")
            raise

def test_profile():
    """Test profile endpoint"""
    setup = TestSetup()
    token = setup.get_token()
    
    try:
        response = requests.get(
            f"{setup.api_url}/api/profiles/current",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Log detailed response for debugging
        logger.info(f"Profile response status: {response.status_code}")
        logger.info(f"Profile response headers: {dict(response.headers)}")
        try:
            logger.info(f"Profile response body: {response.json()}")
        except:
            logger.info(f"Profile response text: {response.text}")
            
        if response.status_code != 200:
            raise Exception(f"Profile request failed: {response.text}")
            
        profile = response.json()
        
        # Verify required fields
        required_fields = [
            'id', 'email', 'preferred_difficulty', 
            'skill_level', 'play_frequency'
        ]
        
        missing_fields = [field for field in required_fields if field not in profile]
        if missing_fields:
            raise Exception(f"Missing required profile fields: {missing_fields}")
            
        logger.info("✓ Profile test passed")
        return True
        
    except Exception as e:
        logger.error(f"Profile test failed: {str(e)}")
        raise

def test_recommendations():
    """Test recommendations endpoint"""
    setup = TestSetup()
    token = setup.get_token()
    
    try:
        response = requests.get(
            f"{setup.api_url}/api/get_recommendations/",
            headers={"Authorization": f"Bearer {token}"},
            params={"zip_code": "30328", "radius": "25"}
        )
        
        logger.info(f"Recommendations response status: {response.status_code}")
        logger.info(f"Recommendations response headers: {dict(response.headers)}")
        try:
            logger.info(f"Recommendations response body: {response.json()}")
        except:
            logger.info(f"Recommendations response text: {response.text}")
            
        if response.status_code != 200:
            raise Exception(f"Recommendations request failed: {response.text}")
            
        logger.info("✓ Recommendations test passed")
        return True
        
    except Exception as e:
        logger.error(f"Recommendations test failed: {str(e)}")
        raise

def test_find_clubs():
    """Test find clubs endpoint"""
    setup = TestSetup()
    token = setup.get_token()
    
    try:
        response = requests.get(
            f"{setup.api_url}/api/find_clubs/",
            headers={"Authorization": f"Bearer {token}"},
            params={"zip_code": "30328", "radius": "25"}
        )
        
        logger.info(f"Find clubs response status: {response.status_code}")
        logger.info(f"Find clubs response headers: {dict(response.headers)}")
        try:
            logger.info(f"Find clubs response body: {response.json()}")
        except:
            logger.info(f"Find clubs response text: {response.text}")
            
        if response.status_code != 200:
            raise Exception(f"Find clubs request failed: {response.text}")
            
        logger.info("✓ Find clubs test passed")
        return True
        
    except Exception as e:
        logger.error(f"Find clubs test failed: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        test_profile()
        test_recommendations()
        test_find_clubs()
        logger.info("All tests passed! ✓")
    except Exception as e:
        logger.error(f"Tests failed: {str(e)}")
        exit(1) 