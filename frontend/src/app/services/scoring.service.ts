import { Injectable } from '@angular/core';
import { ScoringConfig } from '../models/time-photo.model';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  maxYearDifference: 100,
  maxDistanceKm: 15000,
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
    // Quadratic decay to make it harder (punish larger distances more)
    return Math.round(this.config.locationPoints * (ratio * ratio));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getTotalScore(yearGuess: number, yearReal: number, distanceKm: number): number {
    return this.calcYearScore(yearGuess, yearReal) + this.calcPlaceScore(distanceKm);
  }
}
