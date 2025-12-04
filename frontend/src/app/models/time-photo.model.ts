export interface TimePhoto {
    id: string;
    imageUrl: string;
    year: number;

    lat: number;
    lng: number;

    country: string;
    city?: string;

    description?: string;
    tags?: string[];        // Pentru categorii: "war", "culture", "politics", etc.
    difficulty?: 'easy' | 'medium' | 'hard';  // Nivel dificultate
    source?: string;        // Sursa imaginii (credit)
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
    maxYearDifference: number;   // Ex: 100 ani
    maxDistanceKm: number;       // Ex: 20000 km
    yearPoints: number;          // Ex: 500 puncte
    locationPoints: number;      // Ex: 500 puncte
}
