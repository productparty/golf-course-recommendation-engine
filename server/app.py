# Existing imports
import os
import sys
from dotenv import load_dotenv
import logging
from pathlib import Path
from fastapi import FastAPI, Query, HTTPException, Request, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
import psycopg2
import requests
from supabase import create_client
from utils.recommendation_engine import calculate_recommendation_score

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory containing app.py
BASE_DIR = Path(__file__).resolve().parent
env_path = os.path.join(BASE_DIR, '.env')
logger.info(f"Loading environment from: {env_path}")

# Force reload environment variables
if os.path.exists(env_path):
    logger.info("Environment file exists")
    load_dotenv(env_path, override=True)  # Add override=True
else:
    logger.error(f"Environment file not found at {env_path}")

# Remove any frontend-specific env var logging
logger.info("=== Backend Environment Variables ===")
logger.info(f"DB_HOST: {os.getenv('DB_HOST')}")
logger.info(f"DB_PORT: {os.getenv('DB_PORT')}")
logger.info(f"AZURE_MAPS_API_KEY: {os.getenv('AZURE_MAPS_API_KEY')}")

# After loading environment variables
logger.info("================================")

# Define FRONTEND_URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="Golf Course API",
    version="1.0.0",
    description="API for managing golf clubs, courses, reviews, and more.",
)

# Create API router without prefix
api_router = APIRouter()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Your frontend development server
        "https://golf-course-recommendation-engine-mike-watsons-projects.vercel.app"  # Your production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add debug logging before creating DATABASE_CONFIG
logger.info("Raw environment variables:")
logger.info(f"DB_HOST: {os.getenv('DB_HOST')}")
logger.info(f"DB_PORT: {os.getenv('DB_PORT')}")
logger.info(f"DB_USER: {os.getenv('DB_USER')}")
logger.info(f"DB_NAME: {os.getenv('DB_NAME')}")

# Update DATABASE_CONFIG to use environment variables
DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME", "postgres"),
    "user": os.getenv("DB_USER", "postgres.nkknwkentrbbyzgqgpfd"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST", "aws-0-us-east-2.pooler.supabase.com"),
    "port": os.getenv("DB_PORT", "6543"),
    "sslmode": "require"
}

# Add debug logging
logger.info("Database config (excluding password):")
debug_config = {k:v for k,v in DATABASE_CONFIG.items() if k != 'password'}
logger.info(debug_config)

AZURE_MAPS_API_KEY = os.getenv("AZURE_MAPS_API_KEY")

# Update Supabase initialization
def get_supabase_client():
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        return create_client(supabase_url, supabase_key)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        raise

supabase = get_supabase_client()

# Middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "details": str(exc)},
    )

@api_router.get("/health", tags=["Utilities"], summary="Health Check", description="Check the health of the API.")
def health_check():
    return {"status": "ok"}

# Geocode ZIP Code
@api_router.get("/geocode_zip/", tags=["Utilities"])
def get_lat_lng(zip_code: str):
    try:
        # Use Azure Maps Search API with specific parameters for ZIP codes
        url = "https://atlas.microsoft.com/search/address/json"
        params = {
            "api-version": "1.0",
            "subscription-key": AZURE_MAPS_API_KEY,
            "query": zip_code,
            "countrySet": "US",  # Limit to US results
            "limit": 1,  # We only need one result
            "typeahead": False,  # Complete results only
            "language": "en-US"
        }
        
        logger.info(f"Geocoding ZIP code: {zip_code}")
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Log the full response for debugging
        logger.info(f"Azure Maps response: {data}")

        if not data.get("results"):
            raise ValueError(f"No results found for ZIP code {zip_code}")

        result = data["results"][0]
        
        # Verify we got a ZIP code result
        address = result.get("address", {})
        if address.get("countryCode") != "US":
            raise ValueError(f"Result not in US: {address}")

        position = result.get("position", {})
        lat = position.get("lat")
        lng = position.get("lon")

        if not lat or not lng:
            raise ValueError(f"Invalid coordinates in response: {position}")

        logger.info(f"Successfully geocoded {zip_code} to lat={lat}, lng={lng}")
        return lat, lng

    except requests.exceptions.RequestException as e:
        logger.error(f"Azure Maps API request failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to contact geocoding service")
    except ValueError as e:
        logger.error(f"Geocoding validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected geocoding error: {e}")
        raise HTTPException(status_code=500, detail="Internal geocoding error")

@api_router.get("/geocode_zip/", tags=["Utilities"])
def geocode_zip(zip_code: str):
    try:
        lat, lng = get_lat_lng(zip_code)
        return {"lat": lat, "lng": lng}
    except Exception as e:
        logger.error(f"Error in geocode_zip: {e}")
        raise HTTPException(status_code=400, detail="Failed to geocode ZIP code")

@api_router.get("/find_clubs/", tags=["Clubs"], summary="Find Clubs", description="Find golf clubs based on various criteria.")
async def find_clubs(
    zip_code: str,
    radius: int = 10,
    limit: int = 5,
    offset: int = 0,
    price_tier: str | None = None,
    difficulty: str | None = None,
    technologies: str | None = None
):
    try:
        # Get coordinates from ZIP code
        lat, lng = get_lat_lng(zip_code)
        logger.info(f"Geocoded coordinates: lat={lat}, lng={lng}")

        # Base query with filters
        base_query = """
        SELECT DISTINCT
            gc.global_id,
            gc.club_name,
            gc.address,
            gc.city,
            gc.state,
            gc.zip_code,
            gc.price_tier,
            gc.difficulty,
            ST_Distance(
                gc.geom::geography,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
            ) / 1609.34 as distance_miles,
            array_agg(ti.technology_name) FILTER (WHERE ti.technology_name IS NOT NULL) as available_technologies
        FROM golfclub gc
        LEFT JOIN golfclub_technology gct ON gc.global_id = gct.global_id
        LEFT JOIN technologyintegration ti ON gct.technology_id = ti.technology_id
        WHERE ST_DWithin(
            gc.geom::geography,
            ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
            %s * 1609.34
        )
        """
        
        # Start with base parameters
        params = [lng, lat, lng, lat, radius]
        conditions = []

        # Add filters if specified
        if price_tier:
            logger.info(f"Filtering by price_tier: {price_tier}")
            conditions.append("gc.price_tier = %s")
            params.append(price_tier)
        
        if difficulty:
            logger.info(f"Filtering by difficulty: {difficulty}")
            conditions.append("gc.difficulty = %s")
            params.append(difficulty)

        # Add technology filter if specified
        if technologies:
            tech_list = technologies.split(',')
            logger.info(f"Filtering by technologies: {tech_list}")
            conditions.append("""
                EXISTS (
                    SELECT 1
                    FROM golfclub_technology gct2
                    JOIN technologyintegration ti2 ON gct2.technology_id = ti2.technology_id
                    WHERE gct2.global_id = gc.global_id
                    AND ti2.technology_name = ANY(%s)
                )
            """)
            params.append(tech_list)

        # Add conditions to base query
        if conditions:
            base_query += " AND " + " AND ".join(conditions)

        # Add GROUP BY clause before ORDER BY
        base_query += " GROUP BY gc.global_id, gc.club_name, gc.address, gc.city, gc.state, gc.zip_code, gc.price_tier, gc.difficulty, gc.geom"
        base_query += " ORDER BY distance_miles LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        # Log the final query and parameters for debugging
        logger.info(f"Executing query with params: {params}")

        # Get total count first
        count_query = f"""
        SELECT COUNT(*) 
        FROM ({base_query.replace('ORDER BY distance_miles LIMIT %s OFFSET %s', '')}) AS filtered_clubs
        """
        count_params = params[:-2]  # Remove limit and offset

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get total count
                cursor.execute(count_query, count_params)
                total_count = cursor.fetchone()['count']
                
                # Get paginated results
                cursor.execute(base_query, params)
                results = cursor.fetchall()
                
                logger.info(f"Found {total_count} total clubs, returning {len(results)} results")
                
                return {
                    "results": results,
                    "total": total_count,
                    "page": offset // limit + 1,
                    "total_pages": (total_count + limit - 1) // limit
                }

    except Exception as e:
        logger.error(f"Error in find_clubs: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch clubs: {str(e)}")

class UpdateGolfCourseRequest(BaseModel):
    club_id: str
    course_name: str
    num_holes: int
    price_tier: str
    difficulty: str
    zip_code: str
    lat: float
    lng: float

@api_router.put("/golf-courses/{course_id}", tags=["Courses"], summary="Update Golf Course", description="Update a golf course in the database.", operation_id="update_golf_course")
def update_golf_course(course_id: str, course: UpdateGolfCourseRequest):
    """
    Update a golf course in the database.
    """
    try:
        query = """
        UPDATE golfcourse
        SET club_id = %(club_id)s, course_name = %(course_name)s, num_holes = %(num_holes)s, 
            price_tier = %(price_tier)s, difficulty = %(difficulty)s, zip_code = %(zip_code)s, 
            geom = ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326)
        WHERE global_id = %(course_id)s
        """
        course_dict = course.dict()
        course_dict["course_id"] = course_id
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, course_dict)
                conn.commit()
        return {"message": "Course updated successfully"}
    except Exception as e:
        logger.error(f"Error in update_golf_course: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to update golf course: {e}")

@api_router.delete("/golf-courses/{course_id}", tags=["Courses"], summary="Delete Golf Course", description="Delete a golf course from the database.")
def delete_golf_course(course_id: str):
    """
    Delete a golf course from the database.
    """
    try:
        query = "DELETE FROM golfcourse WHERE global_id = %s"
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (course_id,))
                conn.commit()
        return {"message": "Course deleted successfully"}
    except Exception as e:
        logger.error(f"Error in delete_golf_course: {e}")
        raise HTTPException(status_code=400, detail="Failed to delete golf course")

class GolferProfileRequest(BaseModel):
    email: str
    password: str

class GolferProfileResponse(BaseModel):
    golfer_id: str
    email: str
    first_name: str | None  # Allow first_name to be None
    last_name: str | None  # Allow last_name to be None
    handicap_index: float | None  # Allow handicap_index to be None
    preferred_price_range: str | None  # Allow preferred_price_range to be None
    preferred_difficulty: str | None  # Allow preferred_difficulty to be None
    skill_level: str | None  # Allow skill_level to be None
    play_frequency: str | None  # Allow play_frequency to be None
    club_id: str | None  # Allow club_id to be None
    club_name: str | None  # Include club_name in the response model
    preferred_tees: str | None  # Allow preferred_tees to be None
    is_verified: bool  # Include is_verified in the response model

class UpdateGolferProfileRequest(BaseModel):
    first_name: str
    last_name: str
    handicap_index: float
    preferred_price_range: str
    preferred_difficulty: str
    skill_level: str
    play_frequency: str
    club_id: str | None  # Include club_id in the request model
    preferred_tees: str | None  # Allow preferred_tees to be None

class UpdateGolferProfileResponse(BaseModel):
    golfer_id: str
    email: str
    first_name: str
    last_name: str
    handicap_index: float
    preferred_price_range: str
    preferred_difficulty: str
    skill_level: str
    play_frequency: str
    club_id: str | None  # Allow club_id to be None
    preferred_tees: str | None  # Allow preferred_tees to be None

@api_router.get("/get-golfer-profile", tags=["Golfers"], response_model=GolferProfileResponse)
async def get_golfer_profile(request: Request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        
        try:
            user = supabase.auth.get_user(token)
            user_email = user.user.email
            user_id = user.user.id
            logger.info(f"Supabase user: email={user_email}, id={user_id}")
        except Exception as e:
            logger.error(f"Failed to verify token: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user preferences from profiles table
        profile_query = """
        SELECT 
            id as golfer_id,
            email,
            first_name,
            last_name,
            handicap_index,
            preferred_price_range,
            preferred_difficulty,
            skill_level,
            play_frequency,
            p.club_id,
            gc.club_name,
            preferred_tees,
            true as is_verified
        FROM profiles p
        LEFT JOIN golfclub gc ON p.club_id = gc.global_id
        WHERE id = %s
        """
        
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(profile_query, (user_id,))
                profile = cursor.fetchone()
                logger.info(f"Profile data: {profile}")

                if not profile:
                    # Profile should already exist in Supabase
                    profile = {
                        "golfer_id": user_id,
                        "email": user_email,
                        "first_name": None,
                        "last_name": None,
                        "handicap_index": None,
                        "preferred_price_range": None,
                        "preferred_difficulty": None,
                        "skill_level": None,
                        "play_frequency": None,
                        "club_id": None,
                        "club_name": None,
                        "preferred_tees": None,
                        "is_verified": True
                    }

                return profile
                
    except Exception as e:
        logger.error(f"Error in get_golfer_profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/update-golfer-profile", tags=["Golfers"])
async def update_golfer_profile(request: Request, profile_update: UpdateGolferProfileRequest):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        update_query = """
        UPDATE profiles
        SET 
            first_name = %s,
            last_name = %s,
            handicap_index = %s,
            preferred_price_range = %s,
            preferred_difficulty = %s,
            skill_level = %s,
            play_frequency = %s,
            club_id = %s,
            preferred_tees = %s
        WHERE id = %s
        RETURNING 
            id as golfer_id,
            email,
            first_name,
            last_name,
            handicap_index,
            preferred_price_range,
            preferred_difficulty,
            skill_level,
            play_frequency,
            club_id,
            preferred_tees
        """
        
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(update_query, (
                    profile_update.first_name,
                    profile_update.last_name,
                    profile_update.handicap_index,
                    profile_update.preferred_price_range,
                    profile_update.preferred_difficulty,
                    profile_update.skill_level,
                    profile_update.play_frequency,
                    profile_update.club_id,
                    profile_update.preferred_tees,
                    user_id
                ))
                conn.commit()
                updated_profile = cursor.fetchone()
                updated_profile['is_verified'] = True
                return updated_profile

    except Exception as e:
        logger.error(f"Error in update_golfer_profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Database connection function
def get_db_connection():
    try:
        # Add debug logging
        logger.info(f"Connecting to database at {DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}")
        logger.info(f"Using user: {DATABASE_CONFIG['user']}")
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

# Verify database connection on startup
try:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute('SELECT 1')
    logger.info("Database connection successful")
except Exception as e:
    logger.error(f"Failed to connect to database: {e}")
    raise

@api_router.get("/get_recommendations/", tags=["Recommendations"])
async def get_recommendations(
    zip_code: str,
    radius: int = 10,
    limit: int = 5,
    offset: int = 0,
    request: Request = None
):
    try:
        # Get user profile for preferences
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        # Get user preferences from profiles table
        profile_query = """
        SELECT 
            preferred_price_range,
            preferred_difficulty
        FROM profiles
        WHERE id = %s
        """

        # Get coordinates from ZIP code
        lat, lng = get_lat_lng(zip_code)
        logger.info(f"Geocoded coordinates for recommendations: lat={lat}, lng={lng}")

        # Query to get ALL nearby clubs first
        clubs_query = """
        SELECT 
            gc.global_id,
            gc.club_name,
            gc.address,
            gc.city,
            gc.state,
            gc.zip_code,
            gc.price_tier,
            gc.difficulty,
            ST_Distance(
                gc.geom::geography,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
            ) / 1609.34 as distance_miles,
            array_agg(ti.technology_name) FILTER (WHERE ti.technology_name IS NOT NULL) as available_technologies
        FROM golfclub gc
        LEFT JOIN golfclub_technology gct ON gc.global_id = gct.global_id
        LEFT JOIN technologyintegration ti ON gct.technology_id = ti.technology_id
        WHERE ST_DWithin(
            gc.geom::geography,
            ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
            %s * 1609.34
        )
        GROUP BY gc.global_id, gc.club_name, gc.address, gc.city, gc.state, gc.zip_code, gc.price_tier, gc.difficulty, gc.geom
        """

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user preferences
                cursor.execute(profile_query, (user_id,))
                profile = cursor.fetchone()
                if not profile:
                    raise HTTPException(status_code=400, detail="User profile not found")

                # Get all nearby clubs
                cursor.execute(clubs_query, (lng, lat, lng, lat, radius))
                clubs = cursor.fetchall()
                
                logger.info(f"Found {len(clubs)} clubs before scoring")

                # Calculate recommendation scores for all clubs
                scored_clubs = []
                for club in clubs:
                    # Create a copy of the club data to preserve all fields
                    club_data = dict(club)  # This preserves all fields including available_technologies
                    
                    # Add debug logging
                    logger.info(f"Club preferences - difficulty: {club_data['difficulty']}, price_tier: {club_data['price_tier']}")
                    logger.info(f"User preferences - difficulty: {profile['preferred_difficulty']}, price: {profile['preferred_price_range']}")
                    logger.info(f"Club technologies: {club_data.get('available_technologies', [])}")
                    
                    # Calculate score
                    score = calculate_recommendation_score(
                        distance_miles=club_data['distance_miles'],
                        difficulty=club_data['difficulty'],
                        price_tier=club_data['price_tier'],
                        preferred_difficulty=profile['preferred_difficulty'],
                        preferred_price_range=profile['preferred_price_range']
                    )
                    
                    # Add score to the club data
                    club_data['recommendation_score'] = score
                    scored_clubs.append(club_data)

                # Sort by recommendation score (highest first)
                scored_clubs.sort(key=lambda x: x['recommendation_score'], reverse=True)

                # Apply pagination after sorting
                start_idx = offset
                end_idx = offset + limit
                paginated_clubs = scored_clubs[start_idx:end_idx]

                # Log the first result for debugging
                if paginated_clubs:
                    logger.info(f"First result: {paginated_clubs[0]}")

                return {
                    "results": paginated_clubs,
                    "total": len(scored_clubs),
                    "page": offset // limit + 1,
                    "total_pages": (len(scored_clubs) + limit - 1) // limit
                }

    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to get recommendations: {str(e)}")

# At the end of the file, include the router with the /api prefix
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, log_level="info")
