def calculate_recommendation_score(course, user_preferences):
    score = 0
    weights = {
        'distance': 0.25,
        'price': 0.25,
        'difficulty': 0.20,
        'holes': 0.05,
        'membership': 0.05,
        'amenities': 0.10,
        'services': 0.10
    }

    # Base distance score
    max_distance = 100
    distance_score = (max_distance - min(course['distance_miles'], max_distance)) / max_distance
    score += weights['distance'] * distance_score * 100

    # Price match
    if course['price_tier'] == user_preferences['preferred_price_range']:
        score += weights['price'] * 100
    elif course['price_tier'] and user_preferences['preferred_price_range']:
        price_levels = {'$': 1, '$$': 2, '$$$': 3}
        price_diff = abs(
            price_levels.get(course['price_tier'], 0) - 
            price_levels.get(user_preferences['preferred_price_range'], 0)
        )
        if price_diff == 1:
            score += weights['price'] * 50

    # Difficulty match
    if course['difficulty'] == user_preferences['preferred_difficulty']:
        score += weights['difficulty'] * 100
    elif course['difficulty'] and user_preferences['preferred_difficulty']:
        difficulty_levels = {'EASY': 1, 'MEDIUM': 2, 'HARD': 3}
        diff_diff = abs(
            difficulty_levels.get(course['difficulty'].upper(), 0) - 
            difficulty_levels.get(user_preferences['preferred_difficulty'].upper(), 0)
        )
        if diff_diff == 1:
            score += weights['difficulty'] * 50

    # Number of holes match
    if course['number_of_holes'] == user_preferences['number_of_holes']:
        score += weights['holes'] * 100
    elif user_preferences['number_of_holes'] == 'any':
        score += weights['holes'] * 75

    # Membership type match
    if course['club_membership'] == user_preferences['club_membership']:
        score += weights['membership'] * 100

    # Amenities match
    amenities = [
        'driving_range', 'putting_green', 'chipping_green', 
        'practice_bunker', 'restaurant', 'lodging_on_site'
    ]
    amenity_matches = sum(
        1 for amenity in amenities 
        if course.get(amenity) and user_preferences.get(amenity)
    )
    score += weights['amenities'] * (amenity_matches / len(amenities)) * 100

    # Services match
    services = [
        'motor_cart', 'pull_cart', 'golf_clubs_rental',
        'club_fitting', 'golf_lessons'
    ]
    service_matches = sum(
        1 for service in services 
        if course.get(service) and user_preferences.get(service)
    )
    score += weights['services'] * (service_matches / len(services)) * 100

    return round(score, 2)
