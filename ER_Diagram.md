```mermaid
erDiagram
    SequelizeMeta {
        VARCHAR name PK
    }

    alembic_version {
        VARCHAR version_num PK
    }

    golfclub {
        UUID global_id PK
        VARCHAR club_name
        VARCHAR city
        VARCHAR state
        VARCHAR country
        VARCHAR address
        VARCHAR zip_code
        DOUBLE lat
        DOUBLE lng
        DOUBLE slope_men
        DOUBLE slope_women
        BOOLEAN obstacles_present
        DOUBLE avg_rating
        INTEGER total_reviews
        BOOLEAN walking_allowed
        BOOLEAN metal_spikes_allowed
        BOOLEAN fivesomes_allowed
        TEXT dress_code
        BOOLEAN carts_available
        BOOLEAN clubs_available
        BOOLEAN driving_range
        BOOLEAN pitching_chipping_area
        BOOLEAN putting_green
        BOOLEAN teaching_pro
        INTEGER overall_course_length
        DOUBLE overall_slope_rating
        DOUBLE overall_course_rating
        TEXT description
        INTEGER year_built
        TEXT greens_type
        TEXT fairways_type
        GEOGRAPHY geom
        VARCHAR price_tier
        VARCHAR difficulty
    }

    golfclub_reviews {
        SERIAL review_id PK
        UUID club_id FK
        VARCHAR review_source
        DATE review_date
        DOUBLE rating
        TEXT review_text
        VARCHAR reviewer_name
        INTEGER helpful_votes
        TIMESTAMP created_at
        TIMESTAMP updated_at
        DOUBLE pace_of_play_rating
        DOUBLE course_conditions_rating
        DOUBLE staff_friendliness_rating
        DOUBLE value_for_money_rating
        DOUBLE off_course_amenities_rating
        DOUBLE course_difficulty_rating
    }

    golfclub_technology {
        INTEGER technology_id FK
        UUID global_id FK
    }

    golfcourse {
        UUID global_id PK
        VARCHAR course_name
        INTEGER num_holes
        GEOGRAPHY geom
        UUID club_id FK
        BOOLEAN has_gps
        VARCHAR measure_unit
        INTEGER num_coordinates
        TIMESTAMP timestamp_updated
        DOUBLE lat
        DOUBLE lng
        DOUBLE course_rating
        DOUBLE bogey_rating
        DOUBLE slope_rating
        DOUBLE effective_playing_length
        TEXT[] obstacles
    }

    golfcourse_obstacles {
        SERIAL golfcourse_obstacle_id PK
        UUID course_id FK
        INTEGER obstacle_id FK
    }

    golfer_game_history {
        SERIAL game_id PK
        UUID golfer_id FK
        UUID course_id FK
        DATE play_date
        VARCHAR tee_name
        INTEGER total_score
        TIMESTAMP created_at
    }

    golfer_profile {
        NUMERIC handicap_index
        VARCHAR skill_level
        VARCHAR preferred_price_range
        VARCHAR preferred_difficulty
        UUID global_id FK
        UUID club_id FK
        UUID golfer_id PK
        VARCHAR email UNIQUE
        VARCHAR password_hash
        TIMESTAMP created_at
        TIMESTAMP updated_at
        VARCHAR play_frequency
        VARCHAR first_name
        VARCHAR last_name
        TEXT golfer_name
        VARCHAR verification_token
        BOOLEAN is_verified
        VARCHAR preferred_tees
    }

    golfer_saved_courses {
        UUID golfer_id FK
        UUID course_id FK
        TIMESTAMP saved_at
        PK(golfer_id, course_id)
    }

    obstacle_types {
        SERIAL obstacle_id PK
        VARCHAR obstacle_name UNIQUE
    }

    old_course_ids {
        VARCHAR old_course_id PK
        UUID course_global_id FK
    }

    technologyintegration {
        INTEGER technology_id PK
        VARCHAR technology_name
        UUID global_id
    }

    tees {
        SERIAL tee_id PK
        UUID course_id FK
        VARCHAR tee_name UNIQUE
        VARCHAR tee_color
        INTEGER total_length
        DOUBLE course_rating
        DOUBLE slope_rating
    }

    %% Relationships
    golfclub_reviews ||--|{ golfclub : "belongs to"
    golfclub_technology ||--|| golfclub : "references"
    golfclub_technology ||--|| technologyintegration : "uses"
    golfcourse ||--|{ golfclub : "belongs to"
    golfcourse_obstacles ||--|{ golfcourse : "contains"
    golfcourse_obstacles ||--|{ obstacle_types : "includes"
    golfer_game_history ||--|{ golfcourse : "played on"
    golfer_game_history ||--|{ golfer_profile : "played by"
    golfer_profile ||--|{ golfclub : "member of"
    golfer_saved_courses ||--|{ golfcourse : "saved to"
    golfer_saved_courses ||--|{ golfer_profile : "saved by"
    old_course_ids ||--|{ golfcourse : "relates to"
    tees ||--|{ golfcourse : "available at"
