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
    conn = psycopg2.connect(**DATABASE_CONFIG)
    return conn

def get_lat_lng_from_address(address, city, state):
    url = f"https://atlas.microsoft.com/search/address/json"
    params = {
        "subscription-key": AZURE_MAPS_API_KEY,
        "api-version": "1.0",
        "query": f"{address}, {city}, {state}",
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "results" in data and len(data["results"]) > 0:
        address = data["results"][0]["address"]
        if "position" in data["results"][0]:
            return data["results"][0]["position"]["lat"], data["results"][0]["position"]["lon"]
    return None, None

def update_lat_lng():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM golf_clubs_courses")
            records = cursor.fetchall()

            for record in records:
                lat, lng = get_lat_lng_from_address(record['address'], record['city'], record['state'])
                if lat and lng:
                    print(f"Updating record {record['club_id']}:")
                    print(f"  Old Lat: {record['lat']}, New Lat: {lat}")
                    print(f"  Old Lng: {record['lng']}, New Lng: {lng}")

                    cursor.execute("""
                        UPDATE golf_clubs_courses
                        SET lat = %s, lng = %s, geom = ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                        WHERE club_id = %s
                    """, (lat, lng, lng, lat, record['club_id']))
                    conn.commit()

if __name__ == "__main__":
    update_lat_lng()
