import { Injectable } from '@angular/core';
import { GameState } from '../models/game-state.model';

export interface StoredProgress {
  updatedAt: string;
  state: GameState;
}

export interface StoredGameSummary {
  score: number;
  rounds: number;
  maxRounds: number;
  gameMode: 'relaxed' | 'timed';
  finishedAt: string;
}

export interface StatsSnapshot {
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalScore: number;
  history: StoredGameSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PROGRESS_KEY = 'timeguesser_progress_v2';
  private readonly STATS_KEY = 'timeguesser_stats_v1';
  private readonly HISTORY_LIMIT = 20;

  saveProgress(state: GameState): void {
    const payload: StoredProgress = {
      updatedAt: new Date().toISOString(),
      state
    };

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(payload));
  }

  getProgress(): StoredProgress | null {
    const raw = localStorage.getItem(this.PROGRESS_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredProgress;
    } catch (error) {
      console.warn('Could not parse saved progress. Clearing it.', error);
      this.clearProgress();
      return null;
    }
  }

  clearProgress(): void {
    localStorage.removeItem(this.PROGRESS_KEY);
  }

  getStats(): StatsSnapshot {
    const raw = localStorage.getItem(this.STATS_KEY);
    const defaults: StatsSnapshot = {
      gamesPlayed: 0,
      bestScore: 0,
      averageScore: 0,
      totalScore: 0,
      history: []
    };

    if (!raw) {
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<StatsSnapshot>;
      return {
        ...defaults,
        ...parsed,
        history: parsed.history ?? []
      };
    } catch (error) {
      console.warn('Could not parse saved stats. Resetting them.', error);
      this.setStats(defaults);
      return defaults;
    }
  }

  recordCompletedGame(summary: Omit<StoredGameSummary, 'finishedAt'> & { finishedAt?: string }): StatsSnapshot {
    const stats = this.getStats();
    const entry: StoredGameSummary = {
      ...summary,
      finishedAt: summary.finishedAt ?? new Date().toISOString()
    };

    const history = [entry, ...stats.history].slice(0, this.HISTORY_LIMIT);
    const gamesPlayed = stats.gamesPlayed + 1;
    const totalScore = stats.totalScore + entry.score;
    const bestScore = Math.max(stats.bestScore, entry.score);
    const averageScore = Math.round(totalScore / gamesPlayed);

    const updated: StatsSnapshot = {
      gamesPlayed,
      bestScore,
      averageScore,
      totalScore,
      history
    };

    this.setStats(updated);
    return updated;
  }

  private setStats(stats: StatsSnapshot): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }
}
