import requests
import pandas as pd

# API Configuration
API_URL = "https://www.golfapi.io/api/v2.3/courses"
API_KEY = "0710d8e1-10aa-4b3f-b11c-cb8b4d7d451a"

def fetch_courses(page=1, params=None):
    """Fetch golf courses from the API for a given page."""
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = params or {}
    params["page"] = page
    response = requests.get(API_URL, headers=headers, params=params)
    if response.status_code == 401:
        print("Unauthorized: Check your API key.")
    response.raise_for_status()
    return response.json()

def export_to_excel(courses, filename="golf_courses_michigan2.xlsx"):
    """Export courses data to Excel."""
    df = pd.DataFrame(courses)
    df.to_excel(filename, index=False, engine="openpyxl")
    print(f"Data exported to {filename}")

def main():
    """Fetch and export Michigan golf courses."""
    all_courses = []
    page = 1
    params = {"country": "usa", "state": "MI"}  # Filter for Michigan courses using two-letter state code
    
    while True:
        print(f"Fetching page {page} with params: {params}...")
        response = fetch_courses(page=page, params=params)
        courses = response.get("courses", [])
        print(f"Fetched {len(courses)} courses")
        if not courses:
            break
        all_courses.extend(courses)
        page += 1

    print(f"Total courses fetched: {len(all_courses)}")
    if all_courses:
        export_to_excel(all_courses)

if __name__ == "__main__":
    main()