import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GameState } from '../../models/game-state.model';
import { GameStateService } from '../../services/game-state.service';
import { DatasetService } from '../../services/dataset.service';

@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-shell.component.html',
  styleUrls: ['./game-shell.component.css']
})
export class GameShellComponent implements OnInit, OnDestroy {
  state$!: Observable<GameState>;
  guessedYear: number | null = null;
  photoLoadFailed = false;
  dataSource: 'primary' | 'fallback' = 'primary';
  private destroy$ = new Subject<void>();

  constructor(
    private gameStateService: GameStateService,
    private datasetService: DatasetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.state$ = this.gameStateService.state$;

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'] === 'timed' ? 'timed' : 'relaxed';
      this.gameStateService.startGame(mode);
    });

    this.datasetService.dataSource$
      .pipe(takeUntil(this.destroy$))
      .subscribe(source => {
        this.dataSource = source;
      });

    this.gameStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // reset placeholder flag when moving to a new photo/round
        this.photoLoadFailed = false;
      });
  }

  onSubmitGuess(): void {
    if (this.guessedYear === null) {
      return;
    }

    this.gameStateService.submitGuess(this.guessedYear);
  }

  onNextRound(): void {
    this.guessedYear = null;
    this.gameStateService.nextRound();
  }

  onRestart(state: GameState): void {
    this.guessedYear = null;
    this.gameStateService.startGame(state.gameMode, state.maxRounds);
  }

  onImageError(): void {
    this.photoLoadFailed = true;
    console.warn('Image failed to load, showing placeholder.');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
