# Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    GOLFCOURSE {
        INT id PK "Primary Key"
        STRING name
        STRING address
        STRING city
        STRING state
        STRING country
        STRING zip_code
        STRING phone_number
        STRING email
        STRING website
        DOUBLE latitude
        DOUBLE longitude
        DECIMAL rating
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    GOLFERPROFILE {
        INT id PK "Primary Key"
        INT handicap_index
        DECIMAL average_score
        STRING preferred_tee_box "Forward, Middle, Back"
        INT playing_frequency "Rounds per month/year"
        STRING typical_golf_party_size "Solo, Pairs, Foursomes"
        BOOLEAN willingness_to_walk
        STRING preferred_time_of_day "Morning, Afternoon, Twilight"
    }

    CATEGORY {
        INT id PK "Primary Key"
        STRING name
    }

    SUBCATEGORY {
        INT id PK "Primary Key"
        INT category_id FK "Foreign Key to CATEGORY"
        STRING name
    }

    PREFERENCE {
        INT id PK "Primary Key"
        INT subcategory_id FK "Foreign Key to SUBCATEGORY"
        STRING name
    }

    AMENITY {
        INT id PK "Primary Key"
        INT subcategory_id FK "Foreign Key to SUBCATEGORY"
        STRING name
    }

    TECHNOLOGYINTEGRATION {
        INT id PK "Primary Key"
        STRING name
    }

    ENVIRONMENTALCONSIDERATION {
        INT id PK "Primary Key"
        STRING name
    }

    BUDGETANDPRICING {
        INT id PK "Primary Key"
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        STRING budget_type "Green Fees, Membership"
        DECIMAL amount
    }

    TRAVELHABITS {
        INT id PK "Primary Key"
        STRING frequency "Local, Domestic, International"
        STRING preferred_destination
        STRING interest "Golf Resorts, Standalone Courses"
        STRING willingness_to_travel "Distance, Time"
    }

    SOCIALASPECTS {
        INT id PK "Primary Key"
        STRING interest "Tournaments, Social Scenes, Family-Friendly, Golf Instruction"
    }

    GOLFCOURSE_PREFERENCE {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT preference_id FK "Foreign Key to PREFERENCE"
    }

    GOLFCOURSE_AMENITY {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT amenity_id FK "Foreign Key to AMENITY"
    }

    GOLFCOURSE_TECHNOLOGY {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT technology_integration_id FK "Foreign Key to TECHNOLOGYINTEGRATION"
    }

    GOLFCOURSE_ENVIRONMENTAL {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT environmental_consideration_id FK "Foreign Key to ENVIRONMENTALCONSIDERATION"
    }

    GOLFCOURSE_TRAVEL {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT travel_habits_id FK "Foreign Key to TRAVELHABITS"
    }

    GOLFCOURSE_SOCIAL {
        INT golf_course_id FK "Foreign Key to GOLFCOURSE"
        INT social_aspects_id FK "Foreign Key to SOCIALASPECTS"
    }

    GOLFERPROFILE_PREFERENCE {
        INT golfer_profile_id FK "Foreign Key to GOLFERPROFILE"
        INT preference_id FK "Foreign Key to PREFERENCE"
    }

    GOLFERPROFILE_AMENITY {
        INT golfer_profile_id FK "Foreign Key to GOLFERPROFILE"
        INT amenity_id FK "Foreign Key to AMENITY"
    }

    %% Relationships
    GOLFCOURSE ||--o{ GOLFCOURSE_PREFERENCE : has
    PREFERENCE ||--o{ GOLFCOURSE_PREFERENCE : includes
    GOLFCOURSE ||--o{ GOLFCOURSE_AMENITY : has
    AMENITY ||--o{ GOLFCOURSE_AMENITY : includes
    GOLFCOURSE ||--o{ GOLFCOURSE_TECHNOLOGY : has
    TECHNOLOGYINTEGRATION ||--o{ GOLFCOURSE_TECHNOLOGY : includes
    GOLFCOURSE ||--o{ GOLFCOURSE_ENVIRONMENTAL : has
    ENVIRONMENTALCONSIDERATION ||--o{ GOLFCOURSE_ENVIRONMENTAL : includes
    GOLFCOURSE ||--o{ GOLFCOURSE_TRAVEL : has
    TRAVELHABITS ||--o{ GOLFCOURSE_TRAVEL : includes
    GOLFCOURSE ||--o{ GOLFCOURSE_SOCIAL : has
    SOCIALASPECTS ||--o{ GOLFCOURSE_SOCIAL : includes

    GOLFERPROFILE ||--o{ GOLFERPROFILE_PREFERENCE : has
    PREFERENCE ||--o{ GOLFERPROFILE_PREFERENCE : includes
    GOLFERPROFILE ||--o{ GOLFERPROFILE_AMENITY : has
    AMENITY ||--o{ GOLFERPROFILE_AMENITY : includes

    CATEGORY ||--|{ SUBCATEGORY : contains
    SUBCATEGORY ||--|{ PREFERENCE : contains
    SUBCATEGORY ||--|{ AMENITY : contains
