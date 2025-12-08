import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getFirestore,
    Firestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment.example';

export interface LeaderboardEntry {
    playerName: string;
    score: number;
    totalRounds: number;
    gameMode: 'relaxed' | 'timed';
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    private app: FirebaseApp | null = null;
    private db: Firestore | null = null;
    private isConfigured: boolean = false;

    constructor() {
        this.initializeFirebase();
    }

    /**
     * Initialize Firebase (only if configured)
     */
    private initializeFirebase(): void {
        // Check if Firebase is configured
        if (environment.firebase.apiKey === 'YOUR_API_KEY') {
            console.warn('⚠️ Firebase is not configured. Serverless features will not work.');
            this.isConfigured = false;
            return;
        }

        try {
            this.app = initializeApp(environment.firebase);
            this.db = getFirestore(this.app);
            this.isConfigured = true;
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Firebase:', error);
            this.isConfigured = false;
        }
    }

    /**
     * Check if Firebase is configured and available
     */
    isAvailable(): boolean {
        return this.isConfigured && this.db !== null;
    }

    /**
     * Save a score to leaderboard
     */
    async saveScore(entry: Omit<LeaderboardEntry, 'timestamp'>): Promise<void> {
        if (!this.isAvailable()) {
            console.warn('Firebase is not available. Score will not be saved.');
            return;
        }

        try {
            const leaderboardRef = collection(this.db!, 'leaderboard');
            await addDoc(leaderboardRef, {
                ...entry,
                timestamp: Timestamp.now()
            });
            console.log('✅ Score saved to Firebase');
        } catch (error) {
            console.error('❌ Error saving score:', error);
            throw error;
        }
    }

    /**
     * Get top scores from leaderboard
     */
    async getTopScores(gameMode?: 'relaxed' | 'timed', maxResults: number = 10): Promise<LeaderboardEntry[]> {
        if (!this.isAvailable()) {
            console.warn('Firebase is not available. Returning empty list.');
            return [];
        }

        try {
            const leaderboardRef = collection(this.db!, 'leaderboard');

            // Query for top scores
            const q = query(
                leaderboardRef,
                orderBy('score', 'desc'),
                limit(maxResults)
            );

            const querySnapshot = await getDocs(q);
            const scores: LeaderboardEntry[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Filter by gameMode if specified
                if (!gameMode || data['gameMode'] === gameMode) {
                    scores.push({
                        playerName: data['playerName'],
                        score: data['score'],
                        totalRounds: data['totalRounds'],
                        gameMode: data['gameMode'],
                        timestamp: (data['timestamp'] as Timestamp).toDate()
                    });
                }
            });

            return scores;
        } catch (error) {
            console.error('❌ Error loading scores:', error);
            throw error;
        }
    }

    /**
     * Save game progress (cloud backup)
     */
    async saveGameProgress(userId: string, progressData: any): Promise<void> {
        if (!this.isAvailable()) {
            console.warn('Firebase is not available. Progress will not be saved.');
            return;
        }

        try {
            const progressRef = collection(this.db!, 'gameProgress');
            await addDoc(progressRef, {
                userId,
                data: progressData,
                timestamp: Timestamp.now()
            });
            console.log('✅ Progress saved to Firebase');
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            throw error;
        }
    }
}
