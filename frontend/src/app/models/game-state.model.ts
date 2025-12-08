import { TimePhoto } from './time-photo.model';

export type GameStatus = 'idle' | 'loading' | 'in-progress' | 'finished';

export interface GuessSummary {
  guessedYear: number;
  actualYear: number;
  yearDifference: number;
  pointsAwarded: number;
}

export interface GameState {
  status: GameStatus;
  round: number;
  maxRounds: number;
  score: number;
  gameMode: 'relaxed' | 'timed';
  currentPhoto?: TimePhoto;
  lastResult?: GuessSummary;
}
