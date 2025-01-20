import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import psycopg2

# Load environment variables from server/.env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

def test_direct_connection():
    print("\n=== Testing Direct Connection ===")
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "Watso3mj16!",
        "host": "db.nkknwkentrbbyzgqgpfd.supabase.co",
        "port": "5432",
        "sslmode": "require"
    }
    try_connection(db_config, "Direct")

def test_transaction_pooler():
    print("\n=== Testing Transaction Pooler ===")
    db_config = {
        "dbname": "postgres",
        "user": "postgres.nkknwkentrbbyzgqgpfd",
        "password": "Watso3mj16!",
        "host": "aws-0-us-east-2.pooler.supabase.com",
        "port": "6543",
        "sslmode": "require"
    }
    try_connection(db_config, "Transaction Pooler")

def test_session_pooler():
    print("\n=== Testing Session Pooler ===")
    db_config = {
        "dbname": "postgres",
        "user": "postgres.nkknwkentrbbyzgqgpfd",
        "password": "Watso3mj16!",
        "host": "aws-0-us-east-2.pooler.supabase.com",
        "port": "5432",
        "sslmode": "require"
    }
    try_connection(db_config, "Session Pooler")

def try_connection(config, connection_type):
    print(f"\nTrying {connection_type} connection with:")
    for key, value in config.items():
        if key != "password":
            print(f"{key}: {value}")
    
    try:
        conn = psycopg2.connect(**config)
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM golfclub")
            count = cur.fetchone()[0]
        print(f"✅ {connection_type} connection successful")
        print(f"Number of golf clubs in database: {count}")
        conn.close()
    except Exception as e:
        print(f"❌ {connection_type} connection failed")
        print(f"Error: {str(e)}")

def test_supabase():
    print("\n=== Testing Supabase API Connection ===")
    supabase_url = "https://nkknwkentrbbyzgqgpfd.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra253a2VudHJiYnl6Z3FncGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzA4MzYsImV4cCI6MjA1MjgwNjgzNn0.OyizXugP02ciUdXTOWxfTrp1HwsMgBM7FyeJ8le0_mM"
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        response = supabase.table("golfclub").select("*").limit(1).execute()
        print("✅ Supabase API connection successful")
        print(f"Sample data: {response.data}")
    except Exception as e:
        print("❌ Supabase API connection failed")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_direct_connection()
    test_transaction_pooler()
    test_session_pooler()
    test_supabase()
