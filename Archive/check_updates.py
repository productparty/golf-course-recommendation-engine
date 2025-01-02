import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_CONFIG = {
    "dbname": "golf_recommendation",
    "user": "postgres",
    "password": "password",
    "host": "localhost",
    "port": "5432",
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        print("Database connection successful")
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def check_updates():
    conn = get_db_connection()
    if conn is None:
        return

    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            try:
                cursor.execute("SELECT club_id, address, city, state, lat, lng FROM golf_clubs_courses LIMIT 10")
                records = cursor.fetchall()
                if not records:
                    print("No records found")
                for record in records:
                    print(record)
            except Exception as e:
                print(f"Error fetching records: {e}")

if __name__ == "__main__":
    check_updates()
