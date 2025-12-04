import { Injectable } from '@angular/core';
import { FirebaseService, LeaderboardEntry } from './firebase.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class ScoreService {

    constructor(
        private firebaseService: FirebaseService,
        private localStorageService: LocalStorageService
    ) { }

    /**
     * Save score (Firebase + localStorage for backup)
     */
    async saveScore(entry: Omit<LeaderboardEntry, 'timestamp'>): Promise<void> {
        const fullEntry: LeaderboardEntry = {
            ...entry,
            timestamp: new Date()
        };

        // Always save locally
        this.localStorageService.saveScore(fullEntry);

        // Try to save to Firebase if available
        if (this.firebaseService.isAvailable()) {
            try {
                await this.firebaseService.saveScore(entry);
            } catch (error) {
                console.warn('Failed to save to Firebase, but saved locally:', error);
            }
        }
    }

    /**
     * Get scores (prefers Firebase, falls back to localStorage)
     */
    async getTopScores(gameMode?: 'relaxed' | 'timed', maxResults: number = 10): Promise<LeaderboardEntry[]> {
        // Try Firebase first
        if (this.firebaseService.isAvailable()) {
            try {
                const firebaseScores = await this.firebaseService.getTopScores(gameMode, maxResults);
                if (firebaseScores.length > 0) {
                    return firebaseScores;
                }
            } catch (error) {
                console.warn('Failed to load from Firebase, using local storage:', error);
            }
        }

        // Fallback to localStorage
        return this.localStorageService.getScores(gameMode, maxResults);
    }

    /**
     * Get score statistics
     */
    async getScoreStats(gameMode?: 'relaxed' | 'timed'): Promise<{
        totalGames: number;
        averageScore: number;
        bestScore: number;
        worstScore: number;
    }> {
        const scores = await this.getTopScores(gameMode, 100);

        if (scores.length === 0) {
            return {
                totalGames: 0,
                averageScore: 0,
                bestScore: 0,
                worstScore: 0
            };
        }

        const scoreValues = scores.map(s => s.score);

        return {
            totalGames: scores.length,
            averageScore: Math.round(scoreValues.reduce((a, b) => a + b, 0) / scores.length),
            bestScore: Math.max(...scoreValues),
            worstScore: Math.min(...scoreValues)
        };
    }

    /**
     * Check if a score is in top 10
     */
    async isTopScore(score: number, gameMode: 'relaxed' | 'timed'): Promise<boolean> {
        const topScores = await this.getTopScores(gameMode, 10);

        if (topScores.length < 10) return true;

        return score > topScores[topScores.length - 1].score;
    }

    /**
     * Clear all local scores (does not affect Firebase)
     */
    clearLocalScores(): void {
        this.localStorageService.clearScores();
    }
}
