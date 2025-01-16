def calculate_recommendation_score(distance_miles, difficulty, price_tier, preferred_difficulty, preferred_price_range):
    score = 0
    weight_price = 0.4
    weight_difficulty = 0.3
    weight_distance = 0.3

    # Price Match
    if price_tier == preferred_price_range:
        score += weight_price * 100

    # Difficulty Match
    if difficulty == preferred_difficulty:
        score += weight_difficulty * 100

    # Distance Score (inverse relationship)
    max_distance = 100 # Assuming 100 miles is the maximum distance
    distance_score = (max_distance - distance_miles) / max_distance
    score += weight_distance * distance_score * 100

    return score
