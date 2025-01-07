from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
import psycopg2
import logging
import requests
from recommendation_engine import calculate_recommendation_score
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

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

# Find Courses Endpoint
@app.get("/find_courses/")
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
            gc.course_id,
            gc.club_name,
            gc.course_name,
            gc.city,
            gc.state,
            gc.zip_code,
            gc.price_tier,
            gc.difficulty,
            ST_Distance(gc.geom::geography, z.geog) / 1609.34 AS distance_miles,
            array_agg(t.technology_name) FILTER (WHERE t.technology_name IS NOT NULL) AS technologies
        FROM 
            golf_clubs_courses gc
        LEFT JOIN golfcourse_technology gt ON gc.course_id = gt.course_id
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
            filters.append(
                """
                EXISTS (
                    SELECT 1 FROM golfcourse_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.course_id = gc.course_id
                    AND t.technology_name = ANY(%s)
                )
                """
            )
            params.append(technologies.split(","))

        if filters:
            query += " AND " + " AND ".join(filters)

        query += """
        GROUP BY gc.course_id, z.geog
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

# Get Recommendations Endpoint
@app.get("/get_recommendations/")
def get_recommendations(
    zip_code: str,
    radius: int = 10,
    skill_level: str = None,
    preferred_price_range: str = None,
    technologies: str = None,
):
    try:
        lat, lng = get_lat_lng(zip_code)
        query = """
        WITH zip_centroid AS (
            SELECT ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography AS geog
        )
        SELECT 
            gc.course_id,
            gc.club_name,
            gc.course_name,
            gc.city,
            gc.state,
            gc.zip_code,
            gc.price_tier,
            gc.difficulty,
            ST_Distance(gc.geom::geography, z.geog) / 1609.34 AS distance_miles,
            array_agg(t.technology_name) FILTER (WHERE t.technology_name IS NOT NULL) AS technologies
        FROM 
            golf_clubs_courses gc
        LEFT JOIN golfcourse_technology gt ON gc.course_id = gt.course_id
        LEFT JOIN technologyintegration t ON gt.technology_id = t.technology_id,
            zip_centroid z
        WHERE 
            ST_DWithin(gc.geom::geography, z.geog, %s * 1609.34)
        """
        filters = []
        params = [lng, lat, radius]

        if skill_level:
            difficulty_map = {"Beginner": "Easy", "Intermediate": "Medium", "Advanced": "Hard"}
            filters.append("gc.difficulty = %s")
            params.append(difficulty_map.get(skill_level))
        if preferred_price_range:
            filters.append("gc.price_tier = %s")
            params.append(preferred_price_range)
        if technologies:
            filters.append(
                """
                EXISTS (
                    SELECT 1 FROM golfcourse_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.course_id = gc.course_id
                    AND t.technology_name = ANY(%s)
                )
                """
            )
            params.append(technologies.split(","))

        if filters:
            query += " AND " + " AND ".join(filters)

        query += """
        GROUP BY gc.course_id, z.geog
        ORDER BY ST_Distance(gc.geom::geography, z.geog)
        """

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        recommendations = sorted(
            results,
            key=lambda course: calculate_recommendation_score(
                course,
                {
                    "skill_level": skill_level,
                    "preferred_price_range": preferred_price_range,
                    "technologies": technologies.split(",") if technologies else [],
                },
            ),
            reverse=True,
        )

        return {"results": recommendations[:5]}
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        raise HTTPException(status_code=400, detail="Failed to fetch recommendations")
