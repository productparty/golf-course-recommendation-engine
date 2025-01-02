import requests

AZURE_MAPS_API_KEY = "9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l"

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
