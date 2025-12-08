import { Injectable } from '@angular/core';
import { ScoringConfig } from '../models/time-photo.model';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  maxYearDifference: 100,
  maxDistanceKm: 20000,
  yearPoints: 500,
  locationPoints: 500
};

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  private readonly config: ScoringConfig = { ...DEFAULT_SCORING_CONFIG };

  calcYearScore(yearGuess: number, yearReal: number): number {
    const difference = Math.abs(yearGuess - yearReal);
    const cappedDiff = Math.min(difference, this.config.maxYearDifference);
    const remaining = this.config.maxYearDifference - cappedDiff;
    const ratio = remaining / this.config.maxYearDifference;
    return Math.round(this.config.yearPoints * ratio);
  }

  calcPlaceScore(distanceKm: number): number {
    const nonNegativeDistance = Math.max(0, distanceKm);
    const cappedDistance = Math.min(nonNegativeDistance, this.config.maxDistanceKm);
    const remaining = this.config.maxDistanceKm - cappedDistance;
    const ratio = remaining / this.config.maxDistanceKm;
    return Math.round(this.config.locationPoints * ratio);
  }

  getTotalScore(yearGuess: number, yearReal: number, distanceKm: number): number {
    return this.calcYearScore(yearGuess, yearReal) + this.calcPlaceScore(distanceKm);
  }
}
