erDiagram
    GOLFCOURSE {
        INT course_id PK "Primary Key"
        STRING club_name "Name of the golf club"
        STRING course_name "Name of the specific course"
        STRING address "Street address"
        STRING city "City where the course is located"
        STRING state "State where the course is located"
        STRING zip_code "Zip code"
        DOUBLE lat "Latitude of the course"
        DOUBLE lng "Longitude of the course"
        GEOGRAPHY geom "Geographic point"
        STRING price_tier "Price tier: $, $$, $$$"
        STRING difficulty "Difficulty: Easy, Medium, Hard"
    }

    TECHNOLOGYINTEGRATION {
        INT technology_id PK "Primary Key"
        STRING name "Name of the technology"
    }

    GOLFCOURSE_TECHNOLOGY {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT technology_id FK "Foreign Key to TECHNOLOGYINTEGRATION"
    }

    GOLFERPROFILE {
        INT golfer_id PK "Primary Key"
        STRING name "Name of the golfer"
        INT handicap_index "Handicap index"
        STRING skill_level "Skill Level: Beginner, Intermediate, Advanced"
        STRING preferred_price_range "Preferred price range: $, $$, $$$"
        STRING preferred_difficulty "Preferred difficulty: Easy, Medium, Hard"
    }

    %% Relationships
    GOLFCOURSE ||--o{ GOLFCOURSE_TECHNOLOGY : has
    TECHNOLOGYINTEGRATION ||--o{ GOLFCOURSE_TECHNOLOGY : includes
    GOLFERPROFILE ||--o{ GOLFCOURSE : prefers
