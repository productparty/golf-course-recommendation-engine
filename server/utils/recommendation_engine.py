def calculate_recommendation_score(distance_miles, difficulty, price_tier, preferred_difficulty, preferred_price_range):
    score = 0
    weight_price = 0.4
    weight_difficulty = 0.3
    weight_distance = 0.3

    # Debug logging
    print(f"Scoring - Difficulty: {difficulty} vs {preferred_difficulty}")
    print(f"Scoring - Price: {price_tier} vs {preferred_price_range}")

    # Handle null values
    if not all([difficulty, price_tier, preferred_difficulty, preferred_price_range]):
        # If any preferences are missing, use distance only
        max_distance = 100
        distance_score = (max_distance - min(distance_miles, max_distance)) / max_distance
        return round(distance_score * 100, 2)

    # Normalize values for comparison
    def normalize_value(val):
        if val is None:
            return None
        return str(val).strip().upper()

    difficulty = normalize_value(difficulty)
    preferred_difficulty = normalize_value(preferred_difficulty)
    price_tier = normalize_value(price_tier)
    preferred_price_range = normalize_value(preferred_price_range)

    # Price Match
    if price_tier == preferred_price_range:
        score += weight_price * 100
    elif price_tier and preferred_price_range:
        # Partial match based on price difference
        price_levels = {'$': 1, '$$': 2, '$$$': 3}
        price_diff = abs(price_levels.get(price_tier, 0) - price_levels.get(preferred_price_range, 0))
        if price_diff == 1:  # One level difference
            score += weight_price * 50  # Half score for close match

    # Difficulty Match
    if difficulty == preferred_difficulty:
        score += weight_difficulty * 100
    elif difficulty and preferred_difficulty:
        # Partial match based on difficulty difference
        difficulty_levels = {'EASY': 1, 'MEDIUM': 2, 'HARD': 3}
        diff_diff = abs(difficulty_levels.get(difficulty, 0) - difficulty_levels.get(preferred_difficulty, 0))
        if diff_diff == 1:  # One level difference
            score += weight_difficulty * 50  # Half score for close match

    # Distance Score (inverse relationship)
    max_distance = 100  # Maximum distance to consider
    distance_score = (max_distance - min(distance_miles, max_distance)) / max_distance
    score += weight_distance * distance_score * 100

    return round(score, 2)  # Round to 2 decimal places
