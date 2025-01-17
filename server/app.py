# Existing imports
import os
import sys
from dotenv import load_dotenv
from utils.recommendation_engine import calculate_recommendation_score

# New imports (add these after the existing imports)
from fastapi import FastAPI, Query, HTTPException, Request, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from psycopg2.extras import RealDictCursor
import psycopg2
import logging
import requests
import jwt  # Ensure this import is correct
from datetime import datetime, timedelta
import multipart  # Ensure this import is correct
from pydantic import BaseModel
from typing import List
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer
import bcrypt  # Ensure this import is correct
import sendgrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Load environment variables from .env file
load_dotenv()

# Define FRONTEND_URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="Golf Course API",
    version="1.0.0",
    description="API for managing golf clubs, courses, reviews, and more.",
    openapi_prefix="/api"  # Add this line to set the prefix for all routes
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Use FRONTEND_URL here
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

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Serializer for generating and validating tokens
serializer = URLSafeTimedSerializer(SECRET_KEY)

# Utility function to hash passwords
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Utility function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Utility function to generate verification token
def generate_verification_token(email: str) -> str:
    return serializer.dumps(email, salt="email-confirmation-salt")

# Utility function to confirm verification token
def confirm_verification_token(token: str, expiration=3600) -> str:
    try:
        email = serializer.loads(token, salt="email-confirmation-salt", max_age=expiration)
    except Exception:
        return None
    return email

# Utility function to send confirmation email
def send_confirmation_email(email: str, token: str):
    confirmation_url = f"{FRONTEND_URL}/verify-email?token={token}"
    message = Mail(
        from_email='mike@watsonconsultingandadvisory.com',  # Replace with your verified sender email
        to_emails=email,
        subject='Email Verification',
        html_content=f'<p>Click the link below to verify your email:</p><p><a href="{confirmation_url}">Verify Email</a></p>'
    )
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(str(e))  # Correctly print the error message

# Utility function to send password reset email
def send_password_reset_email(email: str, token: str):
    reset_url = f"{FRONTEND_URL}/password-reset-confirm?token={token}"
    message = Mail(
        from_email='mike@watsonconsultingandadvisory.com',  # Replace with your verified sender email
        to_emails=email,
        subject='Password Reset Request',
        html_content=f'<p>Click the link below to reset your password:</p><p><a href="{reset_url}">Reset Password</a></p>'
    )
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(str(e))  # Correctly print the error message

# Example usage
if __name__ == "__main__":
    send_confirmation_email('to@example.com', 'your_token')

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


@app.get("/api/health", tags=["Utilities"], summary="Health Check", description="Check the health of the API.")
def health_check():
    return {"status": "ok"}


# Geocode ZIP Code
@app.get("/api/geocode_zip/", tags=["Utilities"])
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


@app.get("/api/geocode_zip/", tags=["Utilities"])
def geocode_zip(zip_code: str):
    try:
        lat, lng = get_lat_lng(zip_code)
        return {"lat": lat, "lng": lng}
    except Exception as e:
        logger.error(f"Error in geocode_zip: {e}")
        raise HTTPException(status_code=400, detail="Failed to geocode ZIP code")


@app.get("/api/find_clubs/", tags=["Clubs"], summary="Find Clubs", description="Find golf clubs based on various criteria.")
def find_clubs(
    zip_code: str,
    radius: int = 10,
    price_tier: str = None,
    difficulty: str = None,
    technologies: str = None,
    limit: int = 5,  # Limit the number of results to 5
    offset: int = 0,
):
    try:
        logger.info(f"Received request with parameters: zip_code={zip_code}, radius={radius}, price_tier={price_tier}, difficulty={difficulty}, technologies={technologies}, limit={limit}, offset={offset}")
        lat, lng = get_lat_lng(zip_code)
        query = """
        WITH zip_centroid AS (
            SELECT ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography AS geog
        )
        SELECT 
            g.global_id AS club_id,
            g.club_name,
            g.city,
            g.state,
            g.zip_code,
            g.price_tier,
            g.difficulty,
            ST_Distance(g.geom::geography, z.geog) / 1609.34 AS distance_miles,
            array_agg(t.technology_name) FILTER (WHERE t.technology_name IS NOT NULL) AS technologies
        FROM 
            golfclub g
        LEFT JOIN golfclub_technology gt ON g.global_id = gt.global_id
        LEFT JOIN technologyintegration t ON gt.technology_id = t.technology_id,
            zip_centroid z
        WHERE 
            ST_DWithin(g.geom::geography, z.geog, %s * 1609.34)
        """
        filters = []
        params = [lng, lat, radius]

        if price_tier:
            filters.append("g.price_tier = %s")
            params.append(price_tier)
        if difficulty:
            filters.append("g.difficulty = %s")
            params.append(difficulty)
        if technologies:
            filters.append("""
                EXISTS (
                    SELECT 1 FROM golfclub_technology gt
                    JOIN technologyintegration t ON gt.technology_id = t.technology_id
                    WHERE gt.global_id = g.global_id
                    AND t.technology_name = ANY(%s)
                )
            """)
            params.append(technologies.split(","))

        if filters:
            query += " AND " + " AND ".join(filters)

        query += """
        GROUP BY g.global_id, z.geog
        ORDER BY ST_Distance(g.geom::geography, z.geog)
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        logger.info(f"Executing query with params: {params}")
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        return {"results": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Error in find_clubs: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch clubs: {e}")

class UpdateGolfCourseRequest(BaseModel):
    club_id: str
    course_name: str
    num_holes: int
    price_tier: str
    difficulty: str
    zip_code: str
    lat: float
    lng: float

@app.put("/api/golf-courses/{course_id}", tags=["Courses"], summary="Update Golf Course", description="Update a golf course in the database.", operation_id="update_golf_course")
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

@app.delete("/api/golf-courses/{course_id}", tags=["Courses"], summary="Delete Golf Course", description="Delete a golf course from the database.")
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

# Endpoint for user registration
@app.post("/api/register", tags=["Auth"], summary="Register User", description="Register a new user and send a verification email.")
async def register_user(user: GolferProfileRequest):
    try:
        # Check if email already exists
        query_check_email = "SELECT golfer_id FROM golfer_profile WHERE email = %s"
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_check_email, (user.email,))
                existing_user = cursor.fetchone()
                if existing_user:
                    raise HTTPException(
                        status_code=400,
                        detail="Email already exists. Please click on the following link to log in: <a href='/login'>Log In</a>"
                    )

        # Hash the password
        hashed_password = hash_password(user.password)

        # Generate verification token
        verification_token = generate_verification_token(user.email)

        # Insert user into the database
        query_insert_user = """
        INSERT INTO golfer_profile (email, password_hash, verification_token)
        VALUES (%s, %s, %s)
        RETURNING golfer_id
        """
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_insert_user, (user.email, hashed_password, verification_token))
                user_id = cursor.fetchone()[0]  # Use integer index to access the first element of the tuple
                conn.commit()

        # Send verification email
        send_confirmation_email(user.email, verification_token)

        return {"message": "User registered successfully. Please check your email to verify your account."}
    except Exception as e:
        logger.error(f"Error in register_user: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to register user: {e}")

# Endpoint for email verification
@app.get("/api/verify-email", tags=["Auth"], summary="Verify Email", description="Verify the user's email address.")
async def verify_email(token: str):
    try:
        email = confirm_verification_token(token)
        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        # Update user to set is_verified to True
        query_update_user = "UPDATE golfer_profile SET is_verified = TRUE WHERE email = %s"
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_update_user, (email,))
                conn.commit()

        return {"message": "Email verified successfully"}
    except Exception as e:
        logger.error(f"Error in verify_email: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to verify email: {e}")

# Endpoint for user login
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login", tags=["Auth"], summary="Login User", description="Authenticate a user and return a JWT token.")
async def login_user(request: LoginRequest):
    try:
        query_get_user = "SELECT * FROM golfer_profile WHERE email = %s"
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query_get_user, (request.username,))
                user = cursor.fetchone()
                if not user or not verify_password(request.password, user["password_hash"]):
                    raise HTTPException(status_code=400, detail="Invalid credentials")
                if not user["is_verified"]:
                    raise HTTPException(status_code=400, detail="Email not verified")
                access_token = create_access_token(data={"sub": user["email"]})
                return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error in login_user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Endpoint for getting user profile
@app.get("/api/get-golfer-profile", tags=["Golfers"], response_model=GolferProfileResponse, summary="Get Golfer Profile", description="Retrieve the profile of the authenticated golfer or check if an email exists.")
async def get_golfer_profile(golfer_id: str = None, email: str = None, token: str = Depends(oauth2_scheme)):
    """
    Retrieve the profile of the authenticated golfer or check if an email exists.
    """
    try:
        if golfer_id:
            query = """
            SELECT gp.golfer_id, gp.email, gp.first_name, gp.last_name, gp.handicap_index, gp.preferred_price_range, gp.preferred_difficulty, gp.skill_level, gp.play_frequency, gp.club_id, gc.club_name, gp.preferred_tees, gp.is_verified
            FROM golfer_profile gp
            LEFT JOIN golfclub gc ON gp.club_id = gc.global_id
            WHERE gp.golfer_id = %s
            """
            params = (golfer_id,)
        elif email:
            query = """
            SELECT gp.golfer_id, gp.email, gp.first_name, gp.last_name, gp.handicap_index, gp.preferred_price_range, gp.preferred_difficulty, gp.skill_level, gp.play_frequency, gp.club_id, gc.club_name, gp.preferred_tees, gp.is_verified
            FROM golfer_profile gp
            LEFT JOIN golfclub gc ON gp.club_id = gc.global_id
            WHERE gp.email = %s
            """
            params = (email,)
        else:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email = payload["sub"]
            query = """
            SELECT gp.golfer_id, gp.email, gp.first_name, gp.last_name, gp.handicap_index, gp.preferred_price_range, gp.preferred_difficulty, gp.skill_level, gp.play_frequency, gp.club_id, gc.club_name, gp.preferred_tees, gp.is_verified
            FROM golfer_profile gp
            LEFT JOIN golfclub gc ON gp.club_id = gc.global_id
            WHERE gp.email = %s
            """
            params = (email,)

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                profile = cursor.fetchone()
                if not profile:
                    raise HTTPException(status_code=404, detail="Profile not found")
                # Ensure nullable fields are not None
                profile["first_name"] = profile["first_name"] or ""
                profile["last_name"] = profile["last_name"] or ""
                profile["handicap_index"] = profile["handicap_index"] or 0.0
                profile["preferred_price_range"] = profile["preferred_price_range"] or ""
                profile["preferred_difficulty"] = profile["preferred_difficulty"] or ""
                profile["skill_level"] = profile["skill_level"] or ""
                profile["play_frequency"] = profile["play_frequency"] or ""
                profile["club_id"] = profile["club_id"] or ""
                profile["club_name"] = profile["club_name"] or ""
                profile["preferred_tees"] = profile["preferred_tees"] or ""
                return profile
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Error in get_golfer_profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Verify JWT Token
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Endpoint for updating golfer profile
@app.put("/api/update-golfer-profile", tags=["Golfers"], response_model=UpdateGolferProfileResponse, summary="Update Golfer Profile", description="Update the profile of the authenticated golfer.")
async def update_golfer_profile(profile: UpdateGolferProfileRequest, token: str = Depends(verify_token)):
    """
    Update the profile of the authenticated golfer.
    """
    try:
        email = token["sub"]
        profile_dict = profile.dict()
        profile_dict["email"] = email
        query = """
        UPDATE golfer_profile
        SET first_name = %(first_name)s, last_name = %(last_name)s, handicap_index = %(handicap_index)s, 
            preferred_price_range = %(preferred_price_range)s, preferred_difficulty = %(preferred_difficulty)s, 
            skill_level = %(skill_level)s, play_frequency = %(play_frequency)s, club_id = %(club_id)s, preferred_tees = %(preferred_tees)s
        WHERE email = %(email)s
        RETURNING golfer_id, email, first_name, last_name, handicap_index, preferred_price_range, preferred_difficulty, skill_level, play_frequency, club_id, preferred_tees, is_verified
        """
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, profile_dict)
                updated_profile = cursor.fetchone()
                conn.commit()
        return updated_profile
    except Exception as e:
        logger.error(f"Error in update_golfer_profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Add endpoints for golf clubs, tees, reviews, and saved courses (expand here based on your schema updates)

# Generate JWT Token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

# User Authentication
@app.post("/api/token", tags=["Auth"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM golfer_profile WHERE email = %s", (form_data.username,))
                user = cursor.fetchone()
                if not user or not verify_password(form_data.password, user["password_hash"]):
                    raise HTTPException(status_code=400, detail="Invalid credentials")
                access_token = create_access_token(data={"sub": user["email"]})
                return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Endpoint for password reset request
class PasswordResetRequest(BaseModel):
    email: str

@app.post("/api/password-reset-request", tags=["Auth"], summary="Request Password Reset", description="Request a password reset email.")
async def password_reset_request(request: PasswordResetRequest):
    try:
        query_get_user = "SELECT * FROM golfer_profile WHERE email = %s"
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query_get_user, (request.email,))
                user = cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=400, detail="Email not found")

                # Generate password reset token
                reset_token = generate_verification_token(request.email)

                # Send password reset email
                send_password_reset_email(request.email, reset_token)

        return {"message": "Password reset email sent"}
    except Exception as e:
        logger.error(f"Error in password_reset_request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

class PasswordResetConfirmRequest(BaseModel):
    token: str
    password: str

@app.post("/api/password-reset-confirm", tags=["Auth"], summary="Confirm Password Reset", description="Confirm password reset with token.")
async def password_reset_confirm(request: PasswordResetConfirmRequest):
    try:
        email = confirm_verification_token(request.token)
        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        # Hash the new password
        hashed_password = hash_password(request.password)

        # Update user password
        query_update_password = "UPDATE golfer_profile SET password_hash = %s WHERE email = %s"
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query_update_password, (hashed_password, email))
                conn.commit()

        return {"message": "Password reset successfully"}
    except Exception as e:
        logger.error(f"Error in password_reset_confirm: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

class GolfClubSearchResponse(BaseModel):
    club_id: str
    club_name: str

@app.get("/api/get_recommendations/", tags=["Recommendations"], summary="Get Recommendations", description="Get golf course recommendations based on user preferences.")
async def get_recommendations(
    zip_code: str,
    radius: int = 10,
    limit: int = 3,  # Limit the number of results to 3
    offset: int = 0,
    token: str = Depends(oauth2_scheme)
):
    try:
        logger.info(f"Received request with parameters: zip_code={zip_code}, radius={radius}, limit={limit}, offset={offset}")
        lat, lng = get_lat_lng(zip_code)

        # Get golfer profile from token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload["sub"]
        golfer_profile = await get_golfer_profile(email=email, token=token)

        query = """
        WITH zip_centroid AS (
            SELECT ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography AS geog
        )
        SELECT 
            g.global_id AS club_id,
            g.club_name,
            g.city,
            g.state,
            g.zip_code,
            g.price_tier,
            g.difficulty,
            ST_Distance(g.geom::geography, z.geog) / 1609.34 AS distance_miles
        FROM 
            golfclub g,
            zip_centroid z
        WHERE 
            ST_DWithin(g.geom::geography, z.geog, %s * 1609.34)
        """
        filters = []
        params = [lng, lat, radius]

        if golfer_profile['preferred_price_range']:
            filters.append("g.price_tier = %s")
            params.append(golfer_profile['preferred_price_range'])
        if golfer_profile['preferred_difficulty']:
            filters.append("g.difficulty = %s")
            params.append(golfer_profile['preferred_difficulty'])

        if filters:
            query += " AND " + " AND ".join(filters)

        query += """
        GROUP BY g.global_id, z.geog
        ORDER BY ST_Distance(g.geom::geography, z.geog)
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        logger.info(f"Executing query with params: {params}")
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        # Calculate recommendation scores
        for result in results:
            logger.info(f"Calculating recommendation score for result: {result}")
            try:
                result['recommendation_score'] = calculate_recommendation_score(
                    result['distance_miles'],
                    result['difficulty'],
                    result['price_tier'],
                    golfer_profile['preferred_difficulty'],
                    golfer_profile['preferred_price_range']
                )
            except Exception as e:
                logger.error(f"Error calculating recommendation score for result {result}: {e}")
                result['recommendation_score'] = 0  # Assign a default score

        # Sort results by recommendation score
        results.sort(key=lambda x: x['recommendation_score'], reverse=True)

        return {"results": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch recommendations: {e}")
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch recommendations: {e}")

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, log_level="info")
