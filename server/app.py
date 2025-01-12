# Existing imports
import os
import sys
from dotenv import load_dotenv
from utils.recommendation_engine import calculate_recommendation_score

# New imports (add these after the existing imports)
from fastapi import FastAPI, Query, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from psycopg2.extras import RealDictCursor
import psycopg2
import logging
import requests
import jwt
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Golf Course API",
    version="1.0.0",
    description="API for managing golf clubs, courses, reviews, and more.",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Config
DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

AZURE_MAPS_API_KEY = os.getenv("AZURE_MAPS_API_KEY")

# JWT Secret Key
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database Connection
def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")


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


# Health Check
@app.get("/health")
def health_check():
    return {"status": "ok"}


# Geocode ZIP Code
@app.get("/geocode_zip/", tags=["Utilities"])
def get_lat_lng(zip_code: str):
    try:
        url = "https://atlas.microsoft.com/search/address/json"
        params = {
            "api-version": "1.0",
            "subscription-key": AZURE_MAPS_API_KEY,
            "query": zip_code,
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        us_results = [
            result for result in data.get("results", [])
            if result["address"].get("countryCode") == "US"
        ]
        if not us_results:
            raise ValueError(f"No US results for ZIP code {zip_code}")

        lat = us_results[0]["position"]["lat"]
        lng = us_results[0]["position"]["lon"]
        logger.info(f"Geocoded ZIP code {zip_code} to lat={lat}, lng={lng}")
        return lat, lng
    except Exception as e:
        logger.error(f"Error geocoding ZIP code {zip_code}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to geocode ZIP code {zip_code}")


@app.get("/geocode_zip/", tags=["Utilities"])
def geocode_zip(zip_code: str):
    try:
        lat, lng = get_lat_lng(zip_code)
        return {"lat": lat, "lng": lng}
    except Exception as e:
        logger.error(f"Error in geocode_zip: {e}")
        raise HTTPException(status_code=400, detail="Failed to geocode ZIP code")


@app.get("/find_courses/", tags=["Courses"])
def find_courses(
    zip_code: str,
    radius: int = 10,
    price_tier: str = None,
    difficulty: str = None,
    technologies: str = None,
    limit: int = 10,
    offset: int = 0,
):
    try:
        lat, lng = get_lat_lng(zip_code)
        query = """
        WITH zip_centroid AS (
            SELECT ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography AS geog
        )
        SELECT 
            gc.global_id AS course_id,
            g.club_name,
            gc.course_name,
            gc.num_holes,
            g.city,
            g.state,
            g.zip_code,
            gc.price_tier,
            gc.difficulty,
            ST_Distance(gc.geom::geography, z.geog) / 1609.34 AS distance_miles,
            array_agg(t.technology_name) FILTER (WHERE t.technology_name IS NOT NULL) AS technologies
        FROM 
            golfcourse gc
        LEFT JOIN golfclub g ON gc.club_id = g.global_id
        LEFT JOIN golfcourse_technology gt ON gc.global_id = gt.course_id
        LEFT JOIN technologyintegration t ON gt.technology_id = t.technology_id,
            zip_centroid z
        WHERE 
            ST_DWithin(gc.geom::geography, z.geog, %s * 1609.34)
        """
        filters = []
        params = [lng, lat, radius]

        if price_tier:
            filters.append("gc.price_tier = %s")
            params.append(price_tier)
        if difficulty:
            filters.append("gc.difficulty = %s")
            params.append(difficulty)
        if technologies:
            filters.append("""
                EXISTS (
                    SELECT 1 FROM golfcourse_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.course_id = gc.global_id
                    AND t.technology_name = ANY(%s)
                )
            """)
            params.append(technologies.split(","))

        if filters:
            query += " AND " + " AND ".join(filters)

        query += """
        GROUP BY gc.global_id, g.global_id, z.geog
        ORDER BY ST_Distance(gc.geom::geography, z.geog)
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        return {"results": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Error in find_courses: {e}")
        raise HTTPException(status_code=400, detail="Failed to fetch courses")



@app.post("/api/golf-courses", tags=["Courses"])
def create_golf_course(course: dict):
    """
    Create a new golf course entry in the database.
    """
    try:
        required_fields = ["club_id", "course_name", "num_holes", "price_tier", "difficulty", "zip_code", "lat", "lng"]
        for field in required_fields:
            if field not in course:
                raise ValueError(f"Missing required field: {field}")

        query = """
        INSERT INTO golfcourse 
        (global_id, club_id, course_name, num_holes, price_tier, difficulty, zip_code, geom)
        VALUES 
        (%(global_id)s, %(club_id)s, %(course_name)s, %(num_holes)s, %(price_tier)s, %(difficulty)s, %(zip_code)s, ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326))
        """
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, course)
                conn.commit()
        return {"message": "Course created successfully"}, 201
    except Exception as e:
        logger.error(f"Error in create_golf_course: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create golf course: {e}")

@app.put("/api/golf-courses/{course_id}", tags=["Courses"])
def update_golf_course(course_id: str, course: dict):
    """
    Update a golf course in the database.
    """
    try:
        required_fields = ["club_id", "course_name", "num_holes", "price_tier", "difficulty", "zip_code", "lat", "lng"]
        for field in required_fields:
            if field not in course:
                raise ValueError(f"Missing required field: {field}")

        query = """
        UPDATE golfcourse
        SET club_id = %(club_id)s, course_name = %(course_name)s, num_holes = %(num_holes)s, 
            price_tier = %(price_tier)s, difficulty = %(difficulty)s, zip_code = %(zip_code)s, 
            geom = ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326)
        WHERE global_id = %(course_id)s
        """
        course["course_id"] = course_id
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, course)
                conn.commit()
        return {"message": "Course updated successfully"}
    except Exception as e:
        logger.error(f"Error in update_golf_course: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to update golf course: {e}")

@app.delete("/api/golf-courses/{course_id}", tags=["Courses"])
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


@app.post("/api/golfers", tags=["Golfers"])
def create_golfer(golfer: dict):
    """
    Create a new golfer profile in the database.
    """
    try:
        required_fields = ["golfer_id", "email", "first_name", "last_name", "handicap_index", "preferred_price_range", "preferred_difficulty", "preferred_tees", "skill_level", "play_frequency"]
        for field in required_fields:
            if field not in golfer:
                raise ValueError(f"Missing required field: {field}")

        query = """
        INSERT INTO golfer_profile 
        (golfer_id, email, first_name, last_name, handicap_index, preferred_price_range, preferred_difficulty, preferred_tees, skill_level, play_frequency)
        VALUES 
        (%(golfer_id)s, %(email)s, %(first_name)s, %(last_name)s, %(handicap_index)s, %(preferred_price_range)s, %(preferred_difficulty)s, %(preferred_tees)s, %(skill_level)s, %(play_frequency)s)
        """
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, golfer)
                conn.commit()
        return {"message": "Golfer profile created successfully"}, 201
    except Exception as e:
        logger.error(f"Error in create_golfer: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create golfer profile: {e}")


# Add endpoints for golf clubs, tees, reviews, and saved courses (expand here based on your schema updates)

# Generate JWT Token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

# Verify JWT Token
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# User Authentication
@app.post("/token", tags=["Auth"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
                user = cursor.fetchone()
                if not user or not user["password"] == form_data.password:
                    raise HTTPException(status_code=400, detail="Invalid credentials")
                access_token = create_access_token(data={"sub": user["email"]})
                return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Create Account
@app.post("/create-account", tags=["Auth"])
async def create_account(user: dict):
    try:
        required_fields = ["email", "password", "first_name", "last_name"]
        for field in required_fields:
            if field not in user:
                raise ValueError(f"Missing required field: {field}")

        query = """
        INSERT INTO users (email, password, first_name, last_name)
        VALUES (%(email)s, %(password)s, %(first_name)s, %(last_name)s)
        """
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, user)
                conn.commit()
        return {"message": "Account created successfully"}, 201
    except Exception as e:
        logger.error(f"Error in create_account: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create account: {e}")

# Get Golfer Profile
@app.get("/golfer-profile", tags=["Golfers"])
async def get_golfer_profile(token: str = Depends(verify_token)):
    try:
        email = token["sub"]
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM golfer_profile WHERE email = %s", (email,))
                profile = cursor.fetchone()
                if not profile:
                    raise HTTPException(status_code=404, detail="Profile not found")
                return profile
    except Exception as e:
        logger.error(f"Error in get_golfer_profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8080, log_level="info")
