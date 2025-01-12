create table golfer_profile (
  golfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  golfer_name VARCHAR(255) NOT NULL,
  handicap_index INTEGER,
  preferred_price_range VARCHAR(10),
  preferred_difficulty VARCHAR(50),
  preferred_tees VARCHAR(50),
  skill_level VARCHAR(50),
  club_id UUID REFERENCES golfclub(global_id) ON DELETE SET NULL,
  play_frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
