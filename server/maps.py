import os
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

AZURE_MAPS_API_KEY = os.getenv("AZURE_MAPS_API_KEY")

def geocode_address(zip_code):
    url = "https://atlas.microsoft.com/search/address/json"
    params = {
        "api-version": "1.0",
        "subscription-key": AZURE_MAPS_API_KEY,
        "query": zip_code,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def validate_address(address: str, city: str, state: str):
    """
    Validate an address using Azure Maps API.
    """
    query = f"{address}, {city}, {state}"
    url = f"https://atlas.microsoft.com/search/address/json"
    params = {
        "subscription-key": AZURE_MAPS_API_KEY,
        "api-version": "1.0",
        "query": query,
    }
    response = requests.get(url, params=params)
    data = response.json()

    if "results" in data and len(data["results"]) > 0:
        result = data["results"][0]
        return {
            "address": result["address"]["freeformAddress"],
            "zip_code": result["address"]["postalCode"],
            "latitude": result["position"]["lat"],
            "longitude": result["position"]["lon"],
        }
    else:
        return None
