from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
import psycopg2
import logging
import requests
from .utils.recommendation_engine import calculate_recommendation_score
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


# Geocode ZIP Code Endpoint
@app.get("/geocode_zip/")
def geocode_zip(zip_code: str):
    try:
        lat, lng = get_lat_lng(zip_code)
        return {"lat": lat, "lng": lng}
    except Exception as e:
        logger.error(f"Error in geocode_zip: {e}")
        raise HTTPException(status_code=400, detail="Failed to geocode ZIP code")


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
            filters.append("""
                EXISTS (
                    SELECT 1 FROM golfcourse_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.course_id = gc.course_id
                    AND t.technology_name = ANY(%s)
                )
            """)
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

# Get all golf courses endpoint
@app.get("/api/golf-courses")
def get_all_golf_courses(limit: int = 10, offset: int = 0):
    try:
        query = "SELECT * FROM golf_clubs_courses LIMIT %s OFFSET %s"
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (limit, offset))
                results = cursor.fetchall()
        return results  # Return the list directly
    except Exception as e:
        logger.error(f"Error in get_all_golf_courses: {e}")
        raise HTTPException(status_code=400, detail="Failed to fetch golf courses")


# Create golf course endpoint
@app.post("/api/golf-courses")
def create_golf_course(course: dict):
    """
    Create a new golf course entry in the database.
    """
    try:
        required_fields = ["club_id", "club_name", "course_name", "city", "state", "price_tier", "difficulty", "zip_code", "lat", "lng"]
        for field in required_fields:
            if field not in course:
                raise ValueError(f"Missing required field: {field}")

        query = """
        INSERT INTO golf_clubs_courses 
        (club_id, club_name, course_name, city, state, price_tier, difficulty, zip_code, geom)
        VALUES 
        (%(club_id)s, %(club_name)s, %(course_name)s, %(city)s, %(state)s, %(price_tier)s, %(difficulty)s, %(zip_code)s, ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326))
        """
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, course)
                conn.commit()
        return {"message": "Course created successfully"}, 201
    except Exception as e:
        logger.error(f"Error in create_golf_course: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create golf course: {e}")

# Update golf course endpoint
@app.put("/api/golf-courses/{course_id}")
def update_golf_course(course_id: str, course: dict):
    """
    Update a golf course in the database.
    """
    try:
        required_fields = ["club_id", "club_name", "course_name", "city", "state", "price_tier", "difficulty", "zip_code", "lat", "lng"]
        for field in required_fields:
            if field not in course:
                raise ValueError(f"Missing required field: {field}")

        query = """
        UPDATE golf_clubs_courses
        SET club_id = %(club_id)s, club_name = %(club_name)s, course_name = %(course_name)s, city = %(city)s, 
            state = %(state)s, price_tier = %(price_tier)s, difficulty = %(difficulty)s, 
            zip_code = %(zip_code)s, geom = ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326)
        WHERE course_id = %(course_id)s
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

# Delete golf course endpoint
@app.delete("/api/golf-courses/{course_id}")
def delete_golf_course(course_id: str):
    """
    Delete a golf course from the database.
    """
    try:
        query = "DELETE FROM golf_clubs_courses WHERE course_id = %s"
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (course_id,))
                conn.commit()
        return {"message": "Course deleted successfully"}
    except Exception as e:
        logger.error(f"Error in delete_golf_course: {e}")
        raise HTTPException(status_code=400, detail="Failed to delete golf course")

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
            filters.append("""
                EXISTS (
                    SELECT 1 FROM golfcourse_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.course_id = gc.course_id
                    AND t.technology_name = ANY(%s)
                )
            """)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8080, log_level="info")
