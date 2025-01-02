import pandas as pd
import psycopg2
import requests

DATABASE_CONFIG = {
    "dbname": "golf_recommendation",
    "user": "postgres",
    "password": "password",
    "host": "localhost",
    "port": "5432",
}

# Load the cleaned data
df = pd.read_csv(r'D:\projects\golf\golf-course-recommendation-engine\golf_clubs_courses_cleaned.csv')

# Ensure the zip_code column is of type string
df['zip_code'] = df['zip_code'].astype(str)

# Function to get ZIP code from latitude and longitude using a geocoding API
def get_zip_code_from_lat_lng(lat, lng):
    url = f"https://atlas.microsoft.com/search/address/reverse/json"
    params = {
        "subscription-key": "9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l",
        "api-version": "1.0",
        "query": f"{lat},{lng}",
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "addresses" in data and len(data["addresses"]) > 0:
        address = data["addresses"][0]["address"]
        if "postalCode" in address:
            return address["postalCode"]
    return None

# Function to get ZIP code from address, city, and state using a geocoding API
def get_zip_code_from_address(address, city, state):
    url = f"https://atlas.microsoft.com/search/address/json"
    params = {
        "subscription-key": "9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l",
        "api-version": "1.0",
        "query": f"{address}, {city}, {state}",
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "results" in data and len(data["results"]) > 0:
        address = data["results"][0]["address"]
        if "postalCode" in address:
            return address["postalCode"]
    return None

# Fill in the missing ZIP codes
for index, row in df.iterrows():
    if pd.isna(row['zip_code']) or row['zip_code'] == 'nan':
        zip_code = get_zip_code_from_lat_lng(row['lat'], row['lng'])
        if not zip_code:
            zip_code = get_zip_code_from_address(row['address'], row['city'], row['state'])
        if zip_code:
            df.at[index, 'zip_code'] = str(zip_code)

# Save the updated data
df.to_csv(r'D:\projects\golf\golf-course-recommendation-engine\golf_clubs_courses_updated.csv', index=False)

# Update the database
def update_database():
    conn = psycopg2.connect(**DATABASE_CONFIG)
    cursor = conn.cursor()
    
    # Create a temporary table
    cursor.execute("""
        CREATE TEMP TABLE temp_golf_clubs_courses AS
        SELECT * FROM golf_clubs_courses LIMIT 0;
    """)
    conn.commit()
    
    # Copy data into the temporary table
    with open(r'D:\projects\golf\golf-course-recommendation-engine\golf_clubs_courses_updated.csv', 'r') as f:
        cursor.copy_expert("COPY temp_golf_clubs_courses FROM STDIN WITH CSV HEADER", f)
    conn.commit()
    
    # Upsert data from the temporary table into the main table
    cursor.execute("""
        INSERT INTO golf_clubs_courses (club_id, club_name, city, state, country, address, timestamp_updated, distance, course_id, course_name, num_holes, has_gps, zip_code, lat, lng)
        SELECT club_id, club_name, city, state, country, address, timestamp_updated, distance, course_id, course_name, num_holes, has_gps, zip_code, lat, lng
        FROM temp_golf_clubs_courses
        ON CONFLICT (course_id) DO UPDATE
        SET club_name = EXCLUDED.club_name,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            country = EXCLUDED.country,
            address = EXCLUDED.address,
            timestamp_updated = EXCLUDED.timestamp_updated,
            distance = EXCLUDED.distance,
            course_name = EXCLUDED.course_name,
            num_holes = EXCLUDED.num_holes,
            has_gps = EXCLUDED.has_gps,
            zip_code = EXCLUDED.zip_code,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng;
    """)
    conn.commit()
    
    # Update the geom column
    cursor.execute("""
        UPDATE golf_clubs_courses
        SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326);
    """)
    conn.commit()
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    update_database()