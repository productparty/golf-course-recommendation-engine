import psycopg2
from psycopg2.extras import RealDictCursor
import requests

DATABASE_CONFIG = {
    "dbname": "golf_recommendation",
    "user": "postgres",
    "password": "password",
    "host": "localhost",
    "port": "5432",
}

AZURE_MAPS_API_KEY = "9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l"

def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        print("Database connection successful")
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_lat_lng_from_address(address, city, state):
    url = f"https://atlas.microsoft.com/search/address/json"
    params = {
        "subscription-key": AZURE_MAPS_API_KEY,
        "api-version": "1.0",
        "query": f"{address}, {city}, {state}",
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raise an exception for HTTP errors
        if response.content:
            try:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    address = data["results"][0]["address"]
                    if "position" in data["results"][0]:
                        return data["results"][0]["position"]["lat"], data["results"][0]["position"]["lon"]
            except ValueError as e:
                print(f"Error parsing JSON response for {address}, {city}, {state}: {e}")
        else:
            print(f"Empty response for {address}, {city}, {state}")
    except requests.RequestException as e:
        print(f"Error fetching lat/lng for {address}, {city}, {state}: {e}")
    return None, None

def verify_lat_lng():
    discrepancies = []
    conn = get_db_connection()
    if conn is None:
        return

    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print("Fetching records from database...")
            cursor.execute("SELECT * FROM golf_clubs_courses")
            records = cursor.fetchall()
            print(f"Fetched {len(records)} records")

            for record in records:
                print(f"Verifying record {record['club_id']}...")
                expected_lat, expected_lng = get_lat_lng_from_address(record['address'], record['city'], record['state'])
                if expected_lat and expected_lng:
                    if record['lat'] != expected_lat or record['lng'] != expected_lng:
                        discrepancies.append({
                            "club_id": record['club_id'],
                            "address": record['address'],
                            "city": record['city'],
                            "state": record['state'],
                            "current_lat": record['lat'],
                            "current_lng": record['lng'],
                            "expected_lat": expected_lat,
                            "expected_lng": expected_lng
                        })

    if discrepancies:
        print("Discrepancies found:")
        for discrepancy in discrepancies:
            print(discrepancy)
    else:
        print("All lat, lng, and geom fields are correct.")

if __name__ == "__main__":
    verify_lat_lng()
