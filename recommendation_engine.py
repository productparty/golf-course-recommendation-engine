def calculate_recommendation_score(course, golfer_preferences):
    score = 0
    weight_price = 0.4
    weight_difficulty = 0.3
    weight_technology = 0.3

    # Price Match
    if course["price_tier"] == golfer_preferences.get("preferred_price_range"):
        score += weight_price * 100

    # Difficulty Match
    if course["difficulty"] == golfer_preferences.get("skill_level"):
        score += weight_difficulty * 100

    # Technology Match
    if "technologies" in golfer_preferences:
        matching_technologies = set(course.get("technologies", [])) & set(golfer_preferences["technologies"])
        score += weight_technology * len(matching_technologies) * 10

    return score
