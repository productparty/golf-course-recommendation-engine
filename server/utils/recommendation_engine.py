import logging

logger = logging.getLogger(__name__)

def calculate_recommendation_score(club, user_preferences):
    """
    Calculate a recommendation score for a golf club based on user preferences.
    Returns a score from 0-100.
    """
    try:
        score = 0
        weights = {
            'distance': 0.25,
            'price': 0.25,
            'difficulty': 0.20,
            'amenities': 0.15,
            'services': 0.15
        }

        # Log inputs for debugging
        logger.info(f"Calculating score for club: {club.get('name')}")
        logger.info(f"User preferences: {user_preferences}")
        
        # Distance score (inverse relationship)
        max_distance = 100  # miles
        distance = min(club['distance_miles'], max_distance)
        distance_score = (1 - (distance / max_distance)) * 100
        score += weights['distance'] * distance_score

        # Price match
        if user_preferences['preferred_price_range'] and club['price_tier']:
            price_score = 100 if user_preferences['preferred_price_range'] == club['price_tier'] else 0
            score += weights['price'] * price_score

        # Difficulty match
        if user_preferences['preferred_difficulty'] and club['difficulty']:
            difficulty_score = 100 if user_preferences['preferred_difficulty'].lower() == club['difficulty'].lower() else 0
            score += weights['difficulty'] * difficulty_score

        # Amenities score
        amenities = ['driving_range', 'putting_green', 'chipping_green', 'practice_bunker', 'restaurant', 'lodging_on_site']
        amenity_count = sum(1 for amenity in amenities if club.get(amenity))
        amenity_score = (amenity_count / len(amenities)) * 100
        score += weights['amenities'] * amenity_score

        # Services score
        services = ['motor_cart', 'pull_cart', 'golf_clubs_rental', 'club_fitting', 'golf_lessons']
        service_count = sum(1 for service in services if club.get(service))
        service_score = (service_count / len(services)) * 100
        score += weights['services'] * service_score

        logger.info(f"Final score for {club.get('name')}: {score}")
        return round(score, 2)

    except Exception as e:
        logger.error(f"Error calculating recommendation score: {str(e)}")
        return 0
