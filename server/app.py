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
from datetime import datetime
import json
import socket
import asyncio
from typing import Optional
from contextlib import contextmanager

# Configure logging
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

# Initialize FastAPI app first
app = FastAPI(
    title="Golf Course API",
    version="1.0.0",
    description="API for managing golf clubs, courses, reviews, and more.",
)

# Create API router without prefix
api_router = APIRouter()

# Configure CORS - clean up the origins string
cors_origins_str = os.getenv("CORS_ORIGINS", "https://golf-club-ui-lac.vercel.app,http://localhost:5173")
origins = [origin.strip() for origin in cors_origins_str.split(",")]
logger.info(f"Configuring CORS with origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    logger.error("Missing Supabase environment variables")
    raise ValueError("Missing required environment variables")

try:
    supabase = create_client(supabase_url, supabase_key)
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    try:
        yield conn
    finally:
        conn.close()

# Middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Add better error handling for timeouts
@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": str(e)
            }
        )

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "details": str(exc)},
    )

@api_router.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "supabase": bool(supabase)}

@api_router.get("/test-connection", tags=["Health"])
async def test_connection():
    return {
        "status": "ok",
        "environment": os.environ.get("RAILWAY_ENVIRONMENT_NAME", "unknown"),
        "timestamp": datetime.now().isoformat()
    }

# Geocode ZIP Code
@api_router.get("/geocode_zip/", tags=["Utilities"])
def get_lat_lng(zip_code: str):
    try:
        # Use Azure Maps Search API with specific parameters for ZIP codes
        url = "https://atlas.microsoft.com/search/address/json"
        params = {
            "api-version": "1.0",
            "subscription-key": os.getenv("AZURE_MAPS_API_KEY"),
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
    first_name: str | None
    last_name: str | None
    handicap_index: float | None
    preferred_price_range: str | None
    preferred_difficulty: str | None
    skill_level: str | None
    play_frequency: str | None
    club_id: str | None
    club_name: str | None
    preferred_tees: str | None
    # New fields
    number_of_holes: str | None
    club_membership: str | None
    driving_range: bool | None
    putting_green: bool | None
    chipping_green: bool | None
    practice_bunker: bool | None
    restaurant: bool | None
    lodging_on_site: bool | None
    motor_cart: bool | None
    pull_cart: bool | None
    golf_clubs_rental: bool | None
    club_fitting: bool | None
    golf_lessons: bool | None

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

@api_router.get("/get-golfer-profile", tags=["Golfers"])
async def get_golfer_profile(request: Request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM profiles 
                    WHERE id = %s
                """, (user_id,))
                profile = cursor.fetchone()
                
                if not profile:
                    # Create default profile if none exists
                    cursor.execute("""
                        INSERT INTO profiles (id, email)
                        VALUES (%s, %s)
                        RETURNING *
                    """, (user_id, user.user.email))
                    profile = cursor.fetchone()
                    conn.commit()

                return profile

    except Exception as e:
        logger.error(f"Error getting golfer profile: {str(e)}")
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

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
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
                        club_name = %s,
                        preferred_tees = %s,
                        number_of_holes = %s,
                        club_membership = %s,
                        driving_range = %s,
                        putting_green = %s,
                        chipping_green = %s,
                        practice_bunker = %s,
                        restaurant = %s,
                        lodging_on_site = %s,
                        motor_cart = %s,
                        pull_cart = %s,
                        golf_clubs_rental = %s,
                        club_fitting = %s,
                        golf_lessons = %s
                    WHERE id = %s
                    RETURNING *
                """, (
                    profile_update.first_name,
                    profile_update.last_name,
                    profile_update.handicap_index,
                    profile_update.preferred_price_range,
                    profile_update.preferred_difficulty,
                    profile_update.skill_level,
                    profile_update.play_frequency,
                    profile_update.club_id,
                    profile_update.club_name,
                    profile_update.preferred_tees,
                    profile_update.number_of_holes,
                    profile_update.club_membership,
                    profile_update.driving_range,
                    profile_update.putting_green,
                    profile_update.chipping_green,
                    profile_update.practice_bunker,
                    profile_update.restaurant,
                    profile_update.lodging_on_site,
                    profile_update.motor_cart,
                    profile_update.pull_cart,
                    profile_update.golf_clubs_rental,
                    profile_update.club_fitting,
                    profile_update.golf_lessons,
                    user_id
                ))
                
                updated_profile = cursor.fetchone()
                if not updated_profile:
                    raise HTTPException(status_code=404, detail="Profile not found")
                    
                conn.commit()
                return updated_profile

    except Exception as e:
        logger.error(f"Error updating golfer profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/get_recommendations/", tags=["Recommendations"])
async def get_recommendations(
    request: Request,
    zip_code: str,
    radius: int = 25
):
    try:
        # Validate auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(
                status_code=401, 
                detail="Authentication token is missing or invalid"
            )
        
        token = auth_header.split(' ')[1]
        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except Exception as auth_error:
            logger.error(f"Authentication error: {str(auth_error)}")
            raise HTTPException(
                status_code=401, 
                detail=f"Failed to validate token: {str(auth_error)}"
            )

        # Get user preferences
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT 
                            preferred_price_range,
                            preferred_difficulty,
                            skill_level,
                            play_frequency,
                            number_of_holes,
                            club_membership,
                            driving_range,
                            putting_green,
                            chipping_green,
                            practice_bunker,
                            restaurant,
                            lodging_on_site,
                            motor_cart,
                            pull_cart,
                            golf_clubs_rental,
                            club_fitting,
                            golf_lessons
                        FROM profiles 
                        WHERE id = %s
                    """, (user_id,))
                    user_preferences = cursor.fetchone()
                    
                    if not user_preferences:
                        raise HTTPException(
                            status_code=404, 
                            detail="User profile not found or incomplete. Please update your profile preferences."
                        )

                    # Log preferences for debugging
                    logger.info(f"Retrieved user preferences: {user_preferences}")

                    # Validate that we have essential preferences
                    essential_prefs = ['preferred_price_range', 'preferred_difficulty']
                    missing_prefs = [pref for pref in essential_prefs if not user_preferences.get(pref)]
                    if missing_prefs:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Missing essential preferences: {', '.join(missing_prefs)}. Please complete your profile."
                        )

                    # Get coordinates from ZIP code
                    try:
                        lat, lng = get_lat_lng(zip_code)
                    except Exception as geo_error:
                        logger.error(f"Geocoding error: {str(geo_error)}")
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Invalid zip code: {str(geo_error)}"
                        )

                    # Get all clubs within radius
                    try:
                        cursor.execute("""
                            SELECT 
                                gc.*,
                                ST_Distance(
                                    gc.geom::geography,
                                    ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
                                ) / 1609.34 as distance_miles
                            FROM golfclub gc
                            WHERE ST_DWithin(
                                gc.geom::geography,
                                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                                %s * 1609.34
                            )
                        """, (lng, lat, lng, lat, radius))
                        
                        clubs = cursor.fetchall()
                        
                        if not clubs:
                            return {
                                "courses": [],
                                "message": "No golf clubs found within the specified radius"
                            }

                        # Calculate recommendations using recommendation_engine
                        from utils.recommendation_engine import calculate_recommendation_score
                        
                        scored_clubs = []
                        for club in clubs:
                            try:
                                score = calculate_recommendation_score(club, user_preferences)
                                club_with_score = dict(club)
                                club_with_score['score'] = score
                                scored_clubs.append(club_with_score)
                            except Exception as score_error:
                                logger.error(f"Error calculating score for club {club.get('name')}: {str(score_error)}")
                                continue

                        # Sort by score descending
                        scored_clubs.sort(key=lambda x: x['score'], reverse=True)

                        return {
                            "courses": scored_clubs,
                            "total": len(scored_clubs)
                        }

                    except Exception as query_error:
                        logger.error(f"Database query error: {str(query_error)}")
                        raise HTTPException(
                            status_code=500, 
                            detail=f"Error fetching golf clubs: {str(query_error)}"
                        )

        except Exception as db_error:
            logger.error(f"Database connection error: {str(db_error)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Database error: {str(db_error)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@api_router.post("/recommend-courses", tags=["Courses"])
async def recommend_courses(request: Request, data: dict):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        # Get user preferences and courses in radius
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user profile
                cursor.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
                profile = cursor.fetchone()
                
                if not profile:
                    raise HTTPException(status_code=404, detail="Profile not found")

                # Get courses within radius
                cursor.execute("""
                    SELECT c.*, 
                        ST_Distance(
                            c.location::geography,
                            (SELECT ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
                            FROM zip_codes WHERE zip_code = %s)
                        ) / 1609.34 as distance_miles
                    FROM courses c
                    WHERE ST_DWithin(
                        c.location::geography,
                        (SELECT ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
                        FROM zip_codes WHERE zip_code = %s),
                        %s * 1609.34
                    )
                """, (data['zip_code'], data['zip_code'], data['radius']))
                
                courses = cursor.fetchall()
                
                # Calculate scores using updated recommendation engine
                scored_courses = []
                for course in courses:
                    score = calculate_recommendation_score(course, profile)
                    scored_courses.append({**course, 'score': score})

                # Sort by score
                scored_courses.sort(key=lambda x: x['score'], reverse=True)

                return {
                    "courses": scored_courses,
                    "total": len(scored_courses)
                }

    except Exception as e:
        logger.error(f"Error in recommend_courses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/debug/profile", tags=["Debug"])
async def debug_profile(request: Request):
    """Debug endpoint to check profile data"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing authentication token")
        
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
                profile = cursor.fetchone()
                
                return {
                    "profile": profile,
                    "timestamp": datetime.now().isoformat()
                }

    except Exception as e:
        logger.error(f"Profile debug error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/debug/token")
async def get_debug_token(request: Request):
    try:
        data = await request.json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
            
        logger.info(f"Attempting authentication for {email}")
        
        try:
            res = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not res.session:
                raise HTTPException(status_code=401, detail="Authentication failed")
                
            return {
                "access_token": res.session.access_token,
                "expires_at": res.session.expires_at
            }
            
        except Exception as auth_error:
            logger.error(f"Authentication error: {str(auth_error)}")
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {str(auth_error)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

# At the end of the file, include the router with the /api prefix
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    """Enhanced health check endpoint"""
    try:
        # Quick DB check
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT 1')
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "hostname": socket.gethostname(),
                "port": os.getenv("PORT", "8000"),
                "database": "connected"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.get("/test")
async def test():
    """Simple test endpoint"""
    return {
        "status": "ok",
        "message": "API is running",
        "timestamp": datetime.now().isoformat()
    }

@app.on_event("startup")
async def startup_event():
    """Log startup information and verify connections"""
    logger.info("=== Application Starting ===")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Host: {socket.gethostname()}")
    logger.info(f"Port: {os.getenv('PORT', '8000')}")
    
    # Test database connection
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT 1')
                logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
    
    # Log all non-sensitive environment variables
    logger.info("Environment variables:")
    for key, value in os.environ.items():
        if not any(secret in key.lower() for secret in ['password', 'key', 'secret']):
            logger.info(f"{key}: {value}")

@app.get("/api/debug")
def debug_info():
    """Endpoint to check server configuration"""
    try:
        # Get CORS middleware in a safer way
        cors_origins = ["*"]  # Default value
        for middleware in app.user_middleware:
            if isinstance(middleware, CORSMiddleware):
                cors_origins = middleware.options.get("allow_origins", ["*"])
                break

        return {
            "timestamp": datetime.now().isoformat(),
            "hostname": socket.gethostname(),
            "python_version": sys.version,
            "port": os.environ.get("PORT", "8000"),
            "env_mode": os.environ.get("ENV", "unknown"),
            "database_configured": all(key in os.environ for key in ["DB_HOST", "DB_PORT", "DB_NAME"]),
            "cors_origins": cors_origins,
            "environment_vars": {
                k: v for k, v in os.environ.items() 
                if not any(secret in k.lower() for secret in ['password', 'key', 'secret'])
            }
        }
    except Exception as e:
        logger.error(f"Debug endpoint error: {str(e)}")
        return {
            "error": str(e),
            "status": "error",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/test-cors")
async def test_cors():
    return {
        "message": "CORS is working",
        "allowed_origins": origins,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/test-auth")
async def test_auth(request: Request):
    try:
        auth_header = request.headers.get('Authorization')
        logger.info("Auth attempt")
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {"status": "error", "detail": "No Bearer token"}
            
        token = auth_header.split(' ')[1]
        logger.info(f"Token received: {token[:10]}...")
        
        try:
            user = supabase.auth.get_user(token)
            return {
                "status": "success",
                "user_id": user.id,
                "email": user.email
            }
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return {"status": "error", "detail": str(e)}
            
    except Exception as e:
        logger.error(f"Auth test error: {str(e)}")
        return {"status": "error", "detail": str(e)}
            
    except Exception as e:
        logger.error(f"Auth test error: {str(e)}")
        return {"status": "error", "detail": str(e)}

@app.get("/api/verify-auth-setup")
async def verify_auth_setup():
    """Verify Supabase auth is properly configured"""
    try:
        if not supabase:
            return {
                "status": "error",
                "message": "Supabase client not initialized",
                "url_configured": bool(supabase_url),
                "service_key_configured": bool(supabase_key)
            }
            
        # Try to list users to verify admin access
        users = supabase.auth.admin.list_users()
        return {
            "status": "success",
            "message": "Supabase auth configured correctly",
            "admin_access": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/cors-debug")
async def cors_debug(request: Request):
    return {
        "allowed_origins": origins,
        "request_origin": request.headers.get("origin"),
        "request_headers": dict(request.headers),
        "cors_enabled": True
    }

@app.get("/api/test-connection")
async def test_connection(request: Request):
    origin = request.headers.get("origin", "No origin")
    return {
        "status": "ok",
        "origin": origin,
        "cors_enabled": True,
        "allowed_origins": origins,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/debug/token")
async def debug_token(request: Request):
    """Debug endpoint for token verification"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return {
                "status": "error",
                "detail": "No Bearer token",
                "headers": dict(request.headers)
            }
            
        token = auth_header.split(' ')[1]
        
        try:
            user = supabase.auth.get_user(token)
            return {
                "status": "success",
                "user": {
                    "id": user.id,
                    "email": user.email
                },
                "token_valid": True,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "detail": str(e),
                "token": token[:10] + "..."
            }
            
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    
    try:
        port = int(os.environ.get("PORT", 8000))
        logger.info(f"Starting server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug")
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise
