export interface TimePhoto {
    id: string;
    imageUrl: string;
    year: number;

    lat: number;
    lng: number;

    country: string;
    city?: string;

    description?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    source?: string;
}

// Interface for user's guess
export interface UserGuess {
    year: number;
    lat: number;
    lng: number;
}

// Interface for round result
export interface RoundResult {
    photo: TimePhoto;
    guess: UserGuess;
    yearDifference: number;      // Absolute difference in years
    distanceKm: number;          // Distance in km
    score: number;               // Score obtained
    maxScore: number;            // Maximum possible score
}

// Interface for scoring configuration
export interface ScoringConfig {
    maxYearDifference: number;
    maxDistanceKm: number;
    yearPoints: number;
    locationPoints: number;
}
