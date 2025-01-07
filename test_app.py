import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    # Setup test data
    course_data = {
        "club_id": "test-club",
        "club_name": "Test Club",
        "city": "Test City",
        "state": "MI",
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
        "lng": 0.0,
        "geom": "POINT(-122.4194 37.7749)"
    }
    client.post("/api/golf-courses", json=course_data)
    yield
    client.delete("/api/golf-courses/test-course")

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_clubs():
    response = client.get("/clubs/", params={"state": "MI", "limit": 5})
    assert response.status_code == 200

def test_get_recommendations():
    response = client.get("/recommendations/", params={"state": "MI", "city": "Detroit", "limit": 3})
    assert response.status_code == 200

def test_geocode_zip():
    response = client.get("/geocode_zip/", params={"zip_code": "48201"})
    assert response.status_code == 200

def test_search_by_zip():
    response = client.get("/search_by_zip/", params={"zip_code": "48201", "radius": 10})
    assert response.status_code == 200

def test_get_all_golf_courses():
    response = client.get("/api/golf-courses")
    assert response.status_code == 200

def test_get_golf_course():
    response = client.get("/api/golf-courses/test-course")
    assert response.status_code in [200, 404]

def test_create_golf_course():
    course_data = {
        "club_id": "new-club",
        "club_name": "New Club",
        "city": "New City",
        "state": "NY",
        "country": "New Country",
        "address": "123 New St",
        "timestamp_updated": "2023-01-01T00:00:00Z",
        "distance": 10,
        "course_id": "new-course",
        "course_name": "New Course",
        "num_holes": 9,
        "has_gps": False,
        "zip_code": "54321",
        "lat": 1.0,
        "lng": 1.0,
        "geom": "POINT(-1.4194 1.7749)"
    }
    response = client.post("/api/golf-courses", json=course_data)
    assert response.status_code == 201

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
        "geom": "POINT(-122.4194 37.7749)"
    }
    response = client.put("/api/golf-courses/test-course", json=course_data)
    assert response.status_code == 200

def test_delete_golf_course():
    response = client.delete("/api/golf-courses/test-course")
    assert response.status_code == 200