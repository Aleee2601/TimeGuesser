import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GameState } from '../../models/game-state.model';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-shell.component.html',
  styleUrls: ['./game-shell.component.css']
})
export class GameShellComponent implements OnInit {
  state$!: Observable<GameState>;
  guessedYear: number | null = null;

  constructor(
    private gameStateService: GameStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.state$ = this.gameStateService.state$;

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'] === 'timed' ? 'timed' : 'relaxed';
      this.gameStateService.startGame(mode);
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
}
