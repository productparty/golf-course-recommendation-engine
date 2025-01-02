from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from maps import validate_address  # Import your function from maps.py
import logging
from cachetools import cached, TTLCache

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow only your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

AZURE_MAPS_API_KEY = "9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l"
DATABASE_CONFIG = {
    "dbname": "golf_recommendation",
    "user": "postgres",
    "password": "password",
    "host": "localhost",
    "port": "5432",
}

class GolfCourse(BaseModel):
    course_id: str
    address: str
    city: str
    state: str
    zip_code: str
    lat: float
    lng: float
    geom: str  # This should be a WKT representation of the geometry

def get_db_connection():
    conn = psycopg2.connect(**DATABASE_CONFIG)
    return conn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache for geocoding results (TTL: 1 hour)
cache = TTLCache(maxsize=100, ttl=3600)

@cached(cache)
def get_lat_lng(zip_code: str):
    url = f"https://atlas.microsoft.com/search/address/json"
    params = {
        "subscription-key": AZURE_MAPS_API_KEY,
        "api-version": "1.0",
        "query": zip_code,
        "countrySet": "US"  # Prioritize US locations
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        logger.info(f"Geocoding response for ZIP code {zip_code}: {data}")

        if "results" in data and len(data["results"]) > 0:
            location = data["results"][0]["position"]
            lat, lng = location["lat"], location["lon"]

            # Validate that the coordinates are within the expected region (USA)
            if 24.396308 <= lat <= 49.384358 and -125.0 <= lng <= -66.93457:
                return lat, lng
            else:
                raise ValueError(f"Geocoded coordinates {lat}, {lng} are outside the expected region for the USA.")
        else:
            raise ValueError(f"Unable to geocode ZIP code: {zip_code}")
    except requests.RequestException as e:
        logger.error(f"Geocoding request failed: {e}")
        raise ValueError(f"Geocoding request failed: {e}")

@app.get("/clubs/")
def get_clubs(state: str = Query(None), limit: int = 10):
    query = "SELECT * FROM golf_clubs_courses"
    filters = []
    params = {}

    if state:
        filters.append("state = %(state)s")
        params["state"] = state

    if filters:
        query += " WHERE " + " AND ".join(filters)

    query += " LIMIT %(limit)s"
    params["limit"] = limit

    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()

    return results

@app.get("/recommendations/")
def get_recommendations(
    state: str = Query(None),
    city: str = Query(None),
    club_id: str = Query(None),
    limit: int = 3
):
    query = "SELECT * FROM golf_clubs_courses"
    filters = []
    params = {}

    if state:
        filters.append("state = %(state)s")
        params["state"] = state

    if city:
        filters.append("city = %(city)s")
        params["city"] = city

    if club_id:
        filters.append("club_id != %(club_id)s")
        filters.append("state = (SELECT state FROM golf_clubs_courses WHERE club_id = %(club_id)s)")
        params["club_id"] = club_id

    if filters:
        query += " WHERE " + " AND ".join(filters)

    query += " LIMIT %(limit)s"
    params["limit"] = limit

    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()

    return results

@app.get("/validate_address/")
def validate_address_api(address: str, city: str, state: str):
    result = validate_address(address, city, state)
    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="Address not found")

@app.get("/geocode_zip/")
def geocode_zip(zip_code: str):
    try:
        lat, lng = get_lat_lng(zip_code)
        return {"lat": lat, "lng": lng}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/search_by_zip/")
def search_by_zip(
    zip_code: str = Query(..., description="ZIP code to search"),
    radius: int = Query(25, ge=1, le=100, description="Search radius in miles")
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
            gc.address,
            gc.city,
            gc.state,
            gc.zip_code,
            gc.lat,
            gc.lng,
            ST_AsText(gc.geom) AS geom_wkt,
            ST_Distance(gc.geom::geography, z.geog) / 1609.34 AS distance_miles
        FROM 
            golf_clubs_courses gc,
            zip_centroid z
        WHERE 
            ST_DWithin(gc.geom::geography, z.geog, %s * 1609.34)
        ORDER BY 
            ST_Distance(gc.geom::geography, z.geog)
        LIMIT 20;
        """
        params = (lng, lat, radius)

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        return results

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/golf-courses/")
def create_golf_course(course: dict):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO golf_clubs_courses (club_name, city, state, country, address, timestamp_updated, distance, course_id, course_name, num_holes, has_gps, zip_code, lat, lng)
                VALUES (%(club_name)s, %(city)s, %(state)s, %(country)s, %(address)s, %(timestamp_updated)s, %(distance)s, %(course_id)s, %(course_name)s, %(num_holes)s, %(has_gps)s, %(zip_code)s, %(lat)s, %(lng)s)
                RETURNING club_id
            """, course)
            club_id = cursor.fetchone()[0]
            conn.commit()
            return {"id": club_id}

@app.get("/api/golf-courses/")
def get_all_golf_courses():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM golf_clubs_courses")
            results = cursor.fetchall()
            return {"data": results}

@app.get("/api/golf-courses/{course_id}")
def get_golf_course(course_id: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM golf_clubs_courses WHERE club_id = %s", (course_id,))
            result = cursor.fetchone()
            if result:
                return result
            else:
                raise HTTPException(status_code=404, detail="Golf Course Not Found")

@app.put("/api/golf-courses/{course_id}")
def update_golf_course(course_id: str, course: dict):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE golf_clubs_courses
                SET club_name = %(club_name)s, city = %(city)s, state = %(state)s, country = %(country)s, address = %(address)s, timestamp_updated = %(timestamp_updated)s, distance = %(distance)s, course_id = %(course_id)s, course_name = %(course_name)s, num_holes = %(num_holes)s, has_gps = %(has_gps)s, zip_code = %(zip_code)s, lat = %(lat)s, lng = %(lng)s
                WHERE club_id = %s
                RETURNING club_id
            """, {**course, "club_id": course_id})
            updated_id = cursor.fetchone()[0]
            conn.commit()
            return {"id": updated_id}

@app.delete("/api/golf-courses/{course_id}")
def delete_golf_course(course_id: str):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM golf_clubs_courses WHERE club_id = %s RETURNING club_id", (course_id,))
            deleted_id = cursor.fetchone()
            if deleted_id:
                conn.commit()
                return {"message": "Golf Course Deleted"}
            else:
                raise HTTPException(status_code=404, detail="Golf Course Not Found")

# Test script
def test_search_by_zip():
    zip_code = "48091"
    radius = 10
    print(f"Testing search_by_zip with ZIP: {zip_code}, radius: {radius}")
    try:
        result = search_by_zip(zip_code, radius)
        print(f"Results: {result}")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    print("Starting test script...")
    test_search_by_zip()
    print("Starting FastAPI server...")
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)