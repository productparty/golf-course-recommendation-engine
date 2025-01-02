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

def get_zip_code_from_address(address, city, state):
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
        if "postalCode" in address:
            return address["postalCode"], data["results"][0]["position"]["lat"], data["results"][0]["position"]["lon"]
    return None, None, None

def validate_and_update():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM golf_clubs_courses")
            records = cursor.fetchall()

            for record in records:
                correct_zip, correct_lat, correct_lng = get_zip_code_from_address(record['address'], record['city'], record['state'])
                if correct_zip and (record['zip_code'] != correct_zip or record['lat'] != correct_lat or record['lng'] != correct_lng):
                    print(f"Updating record {record['club_id']}:")
                    print(f"  Old ZIP: {record['zip_code']}, New ZIP: {correct_zip}")
                    print(f"  Old Lat: {record['lat']}, New Lat: {correct_lat}")
                    print(f"  Old Lng: {record['lng']}, New Lng: {correct_lng}")

                    cursor.execute("""
                        UPDATE golf_clubs_courses
                        SET zip_code = %s, lat = %s, lng = %s, geom = ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                        WHERE club_id = %s
                    """, (correct_zip, correct_lat, correct_lng, correct_lng, correct_lat, record['club_id']))
                    conn.commit()

if __name__ == "__main__":
    validate_and_update()
