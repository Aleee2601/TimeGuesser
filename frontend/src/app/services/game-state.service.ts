import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { DatasetService } from './dataset.service';
import { GameState, GuessSummary } from '../models/game-state.model';
import { ScoringService } from './scoring.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly defaultMaxRounds = 5;
  static readonly ROUND_DURATION = 60;
  private stateSubject = new BehaviorSubject<GameState>({
    status: 'idle',
    round: 0,
    maxRounds: this.defaultMaxRounds,
    score: 0,
    gameMode: 'relaxed'
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor(
    private datasetService: DatasetService,
    private scoringService: ScoringService,
    private storageService: StorageService
  ) { }

  getSnapshot(): GameState {
    return this.stateSubject.value;
  }

  startGame(gameMode: 'relaxed' | 'timed' = 'relaxed', maxRounds: number = this.defaultMaxRounds): void {
    const initialState: GameState = {
      status: 'loading',
      round: 0,
      maxRounds,
      score: 0,
      gameMode
    };

    this.setState(initialState);
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

  submitGuess(guessedYear: number, guessedLocation: { lat: number, lng: number } | null, isTimeout: boolean = false): GuessSummary | undefined {
    const currentState = this.stateSubject.value;

    if (!currentState.currentPhoto || currentState.status !== 'in-progress') {
      return;
    }

    const yearDifference = Math.abs(guessedYear - currentState.currentPhoto.year);

    // Calculate distance if location provided
    let distanceKm = Number.POSITIVE_INFINITY;
    if (guessedLocation) {
      distanceKm = this.scoringService.calculateDistance(
        guessedLocation.lat,
        guessedLocation.lng,
        currentState.currentPhoto.lat,
        currentState.currentPhoto.lng
      );
    }

    const pointsAwarded = this.scoringService.getTotalScore(
      guessedYear,
      currentState.currentPhoto.year,
      distanceKm
    );

    // If timeout, force points to 0 but keep other stats for display
    const finalPoints = isTimeout ? 0 : pointsAwarded;

    const result: GuessSummary = {
      guessedYear,
      actualYear: currentState.currentPhoto.year,
      yearDifference,
      pointsAwarded: finalPoints
    };

    const updatedState: GameState = {
      ...currentState,
      score: currentState.score + finalPoints,
      lastResult: result
    };

    this.setState(updatedState);

    if (currentState.round >= currentState.maxRounds) {
      this.finishGame();
    }

    return result;
  }

  private loadPhotoForRound(round: number, maxRounds: number, gameMode: 'relaxed' | 'timed'): void {
    this.datasetService.getRandomPhoto().pipe(take(1)).subscribe(photo => {
      this.setState({
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

    const finishedState: GameState = {
      ...currentState,
      status: 'finished'
    };

    this.setState(finishedState);
    this.storageService.recordCompletedGame({
      score: finishedState.score,
      rounds: finishedState.round,
      maxRounds: finishedState.maxRounds,
      gameMode: finishedState.gameMode
    });
  }

  private setState(state: GameState): void {
    this.stateSubject.next(state);
    this.storageService.saveProgress(state);
  }
}
