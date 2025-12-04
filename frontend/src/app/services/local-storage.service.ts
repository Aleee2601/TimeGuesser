import { Injectable } from '@angular/core';
import { LeaderboardEntry } from './firebase.service';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private readonly LEADERBOARD_KEY = 'timeguesser_leaderboard';
    private readonly SETTINGS_KEY = 'timeguesser_settings';
    private readonly PROGRESS_KEY = 'timeguesser_progress';

    /**
     * Save a score locally
     */
    saveScore(entry: LeaderboardEntry): void {
        const scores = this.getScores();
        scores.push(entry);

        // Sort and keep only top 100
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 100);

        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(topScores));
    }

    /**
     * Get local scores
     */
    getScores(gameMode?: 'relaxed' | 'timed', maxResults: number = 10): LeaderboardEntry[] {
        const scoresJson = localStorage.getItem(this.LEADERBOARD_KEY);
        if (!scoresJson) return [];

        try {
            let scores: LeaderboardEntry[] = JSON.parse(scoresJson);

            // Convert timestamp strings to Date objects
            scores = scores.map(score => ({
                ...score,
                timestamp: new Date(score.timestamp)
            }));

            // Filter by gameMode if specified
            if (gameMode) {
                scores = scores.filter(s => s.gameMode === gameMode);
            }

            return scores.slice(0, maxResults);
        } catch (error) {
            console.error('Error parsing leaderboard:', error);
            return [];
        }
    }

    /**
     * Clear all local scores
     */
    clearScores(): void {
        localStorage.removeItem(this.LEADERBOARD_KEY);
    }

    /**
     * Save settings
     */
    saveSettings(settings: any): void {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    /**
     * Get settings
     */
    getSettings(): any {
        const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
        return settingsJson ? JSON.parse(settingsJson) : null;
    }

    /**
     * Save game progress
     */
    saveProgress(progress: any): void {
        localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    }

    /**
     * Get game progress
     */
    getProgress(): any {
        const progressJson = localStorage.getItem(this.PROGRESS_KEY);
        return progressJson ? JSON.parse(progressJson) : null;
    }

    /**
     * Clear progress
     */
    clearProgress(): void {
        localStorage.removeItem(this.PROGRESS_KEY);
    }

    /**
     * Clear all local data
     */
    clearAll(): void {
        this.clearScores();
        this.clearProgress();
        localStorage.removeItem(this.SETTINGS_KEY);
    }
}
