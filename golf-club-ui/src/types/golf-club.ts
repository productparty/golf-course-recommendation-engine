export interface GolfClubResponse {
  global_id: string;
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_tier: string;
  difficulty: string;
  number_of_holes: string;
  club_membership: string;
  driving_range: boolean;
  putting_green: boolean;
  chipping_green: boolean;
  practice_bunker: boolean;
  restaurant: boolean;
  lodging_on_site: boolean;
  motor_cart: boolean;
  pull_cart: boolean;
  golf_clubs_rental: boolean;
  club_fitting: boolean;
  golf_lessons: boolean;
  latitude: number;
  longitude: number;
}

export interface FavoriteRecord {
  golfclub_id: string;
  profile_id: string;
  golfclub: GolfClubResponse;
}

export interface FavoriteClub extends GolfClubResponse {
  golfclub_id: string;
  match_percentage: number;
}