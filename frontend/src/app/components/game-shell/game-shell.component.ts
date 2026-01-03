import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GameState } from '../../models/game-state.model';
import { GameStateService } from '../../services/game-state.service';
import { DatasetService } from '../../services/dataset.service';
import { MapComponent } from '../map/map.component';
import { ScoringService } from '../../services/scoring.service';

@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MapComponent],
  templateUrl: './game-shell.component.html',
  styleUrls: ['./game-shell.component.css']
})
export class GameShellComponent implements OnInit, OnDestroy {
  state$!: Observable<GameState>;
  guessedYear: number | null = null;
  photoLoadFailed = false;
  dataSource: 'primary' | 'fallback' = 'primary';
  hintVisible = false;
  private destroy$ = new Subject<void>();

  constructor(
    private gameStateService: GameStateService,
    private datasetService: DatasetService,
    private scoringService: ScoringService,
    private route: ActivatedRoute
  ) { }

  selectedLocation: { lat: number; lng: number } | null = null;
  targetLocation: { lat: number; lng: number } | null = null;
  distanceKm: number = 0;

  timeLeft: number = GameStateService.ROUND_DURATION;
  private timerInterval: any;

  ngOnInit(): void {
    this.state$ = this.gameStateService.state$;

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'] === 'timed' ? 'timed' : 'relaxed';
      this.gameStateService.startGame(mode);
    });

    // Timer subscription
    this.gameStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        // Clear existing timer on any state change to be safe
        this.clearTimer();

        if (state.status === 'in-progress' && state.gameMode === 'timed' && !state.lastResult) {
          this.startTimer();
        } else {
          // If result shown or not in progress, timer is stopped
        }

        // Reset placeholder flag when moving to a new round
        if (!state.lastResult) {
          this.photoLoadFailed = false;
        }
      });

    this.datasetService.dataSource$
      .pipe(takeUntil(this.destroy$))
      .subscribe(source => {
        this.dataSource = source;
      });
  }

  private startTimer(): void {
    this.timeLeft = GameStateService.ROUND_DURATION; // Reset to 60s per round
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.handleTimeout();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimeout(): void {
    this.clearTimer();
    // Submit with timeout flag
    const currentState = this.gameStateService.getSnapshot();
    if (currentState.currentPhoto) {
      // Using current photo year if no guess, just to have a value, logic will force 0 points anyway.
      const guess = this.guessedYear || currentState.currentPhoto.year;

      this.targetLocation = {
        lat: currentState.currentPhoto.lat,
        lng: currentState.currentPhoto.lng
      };

      this.gameStateService.submitGuess(guess, this.selectedLocation, true);
    }
  }

  toggleHint(): void {
    this.hintVisible = !this.hintVisible;
  }

  onSubmitGuess(): void {
    if (this.guessedYear === null || !this.selectedLocation) {
      return;
    }

    const currentState = this.gameStateService.getSnapshot();
    if (currentState.currentPhoto) {
      this.targetLocation = {
        lat: currentState.currentPhoto.lat,
        lng: currentState.currentPhoto.lng
      };

      this.gameStateService.submitGuess(this.guessedYear, this.selectedLocation);
    }
  }

  onMapGuess(location: { lat: number, lng: number }): void {
    this.selectedLocation = location;
  }

  onNextRound(): void {
    this.guessedYear = null;
    this.selectedLocation = null;
    this.targetLocation = null;
    this.hintVisible = false;
    this.gameStateService.nextRound();
  }

  onRestart(state: GameState): void {
    this.guessedYear = null;
    this.selectedLocation = null;
    this.targetLocation = null;
    this.hintVisible = false;
    this.gameStateService.startGame(state.gameMode, state.maxRounds);
  }

  onImageError(): void {
    this.photoLoadFailed = true;
    console.warn('Image failed to load, showing placeholder.');
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
