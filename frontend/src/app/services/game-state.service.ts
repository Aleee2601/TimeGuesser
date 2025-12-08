import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { DatasetService } from './dataset.service';
import { GameState, GuessSummary } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly defaultMaxRounds = 5;
  private stateSubject = new BehaviorSubject<GameState>({
    status: 'idle',
    round: 0,
    maxRounds: this.defaultMaxRounds,
    score: 0,
    gameMode: 'relaxed'
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor(private datasetService: DatasetService) {}

  getSnapshot(): GameState {
    return this.stateSubject.value;
  }

  startGame(gameMode: 'relaxed' | 'timed' = 'relaxed', maxRounds: number = this.defaultMaxRounds): void {
    this.stateSubject.next({
      status: 'loading',
      round: 0,
      maxRounds,
      score: 0,
      gameMode
    });

    this.loadPhotoForRound(1, maxRounds, gameMode);
  }

  nextRound(): void {
    const currentState = this.stateSubject.value;

    if (currentState.status === 'finished') {
      return;
    }

    if (currentState.round >= currentState.maxRounds) {
      this.finishGame();
      return;
    }

    this.loadPhotoForRound(currentState.round + 1, currentState.maxRounds, currentState.gameMode);
  }

  submitGuess(guessedYear: number): GuessSummary | undefined {
    const currentState = this.stateSubject.value;

    if (!currentState.currentPhoto || currentState.status !== 'in-progress') {
      return;
    }

    const yearDifference = Math.abs(guessedYear - currentState.currentPhoto.year);
    const pointsAwarded = Math.max(0, 100 - yearDifference);

    const result: GuessSummary = {
      guessedYear,
      actualYear: currentState.currentPhoto.year,
      yearDifference,
      pointsAwarded
    };

    const updatedState: GameState = {
      ...currentState,
      score: currentState.score + pointsAwarded,
      lastResult: result
    };

    this.stateSubject.next(updatedState);

    if (currentState.round >= currentState.maxRounds) {
      this.finishGame();
    }

    return result;
  }

  private loadPhotoForRound(round: number, maxRounds: number, gameMode: 'relaxed' | 'timed'): void {
    this.datasetService.getRandomPhoto().pipe(take(1)).subscribe(photo => {
      this.stateSubject.next({
        status: 'in-progress',
        round,
        maxRounds,
        score: this.stateSubject.value.score,
        gameMode,
        currentPhoto: photo,
        lastResult: undefined
      });
    });
  }

  private finishGame(): void {
    const currentState = this.stateSubject.value;

    this.stateSubject.next({
      ...currentState,
      status: 'finished'
    });
  }
}
