import uuid  # Add this import
from fastapi.testclient import TestClient
from server.app import app

client = TestClient(app)

def test_get_clubs():
    response = client.get("/find_courses/", params={"zip_code": "48201", "radius": 10})  # Updated params
    assert response.status_code == 200
    assert "results" in response.json()

def test_get_recommendations():
    response = client.get("/get_recommendations/", params={"zip_code": "48201", "radius": 10})  # Updated params
    assert response.status_code == 200
    assert "results" in response.json()

def test_geocode_zip():
    response = client.get("/geocode_zip/", params={"zip_code": "48201"})
    assert response.status_code == 200
    assert "lat" in response.json()
    assert "lng" in response.json()

def test_search_by_zip():
    response = client.get("/find_courses/", params={"zip_code": "48201", "radius": 10})  # Updated params
    assert response.status_code == 200
    assert "results" in response.json()

def test_get_all_golf_courses():
    response = client.get("/api/golf-courses")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_golf_course():
    course_id = str(uuid.uuid4())  # Generate a unique course_id
    course_data = {
        "club_id": "new-club",
        "club_name": "New Club",
        "city": "New City",
        "state": "NY",
        "country": "New Country",
        "address": "123 New St",
        "timestamp_updated": "2023-01-01T00:00:00Z",
        "distance": 10,
        "course_id": course_id,  # Use the generated course_id
        "course_name": "New Course",
        "num_holes": 9,
        "has_gps": False,
        "zip_code": "54321",
        "lat": 1.0,
        "lng": 1.0,
        "geom": "POINT(-1.4194 1.7749)",
        "price_tier": "$$",
        "difficulty": "Medium"  # Add the difficulty field
    }
    response = client.post("/api/golf-courses", json=course_data)
    assert response.status_code == 201
    assert "message" in response.json()

    # Clean up by deleting the created course
    response = client.delete(f"/api/golf-courses/{course_id}")
    assert response.status_code == 200

def test_update_golf_course():
    course_data = {
        "club_id": "test-club",
        "club_name": "Updated Club",
        "city": "Updated City",
        "state": "MI",
        "country": "Updated Country",
        "address": "123 Updated St",
        "timestamp_updated": "2023-01-01T00:00:00Z",
        "distance": 5,
        "course_id": "test-course",
        "course_name": "Updated Course",
        "num_holes": 18,
        "has_gps": True,
        "zip_code": "12345",
        "lat": 0.0,
        "lng": 0.0,
        "geom": "POINT(-122.4194 37.7749)",
        "price_tier": "$$$",
        "difficulty": "Hard"  # Add the difficulty field
    }
    response = client.put("/api/golf-courses/test-course", json=course_data)
    assert response.status_code == 200
    assert "message" in response.json()

def test_delete_golf_course():
    response = client.delete("/api/golf-courses/test-course")
    assert response.status_code == 200
