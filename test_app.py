import pytest
from fastapi.testclient import TestClient
from src.routes.golf_courses import app  # Adjust the import to match your project structure

client = TestClient(app)

def test_get_clubs():
    response = client.get("/clubs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_recommendations():
    response = client.get("/recommendations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_validate_address_api():
    response = client.get("/validate_address/", params={"address": "1600 Amphitheatre Parkway", "city": "Mountain View", "state": "CA"})
    assert response.status_code == 200

def test_geocode_zip():
    response = client.get("/geocode_zip/", params={"zip_code": "94043"})
    assert response.status_code == 200
    assert "lat" in response.json()
    assert "lng" in response.json()

def test_search_by_zip():
    response = client.get("/search_by_zip/", params={"zip_code": "94043", "radius": 10})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_golf_course():
    course_data = {
        "club_name": "Test Club",
        "city": "Test City",
        "state": "TS",
        "country": "Test Country",
        "address": "123 Test St",
        "timestamp_updated": "2023-01-01T00:00:00Z",
        "distance": 0,
        "course_id": "test-course",
        "course_name": "Test Course",
        "num_holes": 18,
        "has_gps": True,
        "zip_code": "12345",
        "lat": 0.0,
        "lng": 0.0
    }
    response = client.post("/api/golf-courses/", json=course_data)
    assert response.status_code == 200
    assert "id" in response.json()

def test_get_all_golf_courses():
    response = client.get("/api/golf-courses/")
    assert response.status_code == 200
    assert "data" in response.json()

def test_get_golf_course():
    course_id = "test-course"
    response = client.get(f"/api/golf-courses/{course_id}")
    assert response.status_code == 200

def test_update_golf_course():
    course_id = "test-course"
    course_data = {
        "club_name": "Updated Test Club",
        "city": "Updated Test City",
        "state": "UT",
        "country": "Updated Test Country",
        "address": "123 Updated Test St",
        "timestamp_updated": "2023-01-01T00:00:00Z",
        "distance": 0,
        "course_id": "test-course",
        "course_name": "Updated Test Course",
        "num_holes": 18,
        "has_gps": True,
        "zip_code": "12345",
        "lat": 0.0,
        "lng": 0.0
    }
    response = client.put(f"/api/golf-courses/{course_id}", json=course_data)
    assert response.status_code == 200
    assert "id" in response.json()

def test_delete_golf_course():
    course_id = "test-course"
    response = client.delete(f"/api/golf-courses/{course_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Golf Course Deleted"

def test_simple():
    assert 1 + 1 == 2