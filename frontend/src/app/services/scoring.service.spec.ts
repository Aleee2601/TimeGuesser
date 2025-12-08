import { TestBed } from '@angular/core/testing';
import { DEFAULT_SCORING_CONFIG, ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('gives max year points for an exact match', () => {
    expect(service.calcYearScore(1950, 1950)).toBe(DEFAULT_SCORING_CONFIG.yearPoints);
  });

  it('returns zero year points once past the cap', () => {
    expect(service.calcYearScore(1900, 2105)).toBe(0);
  });

  it('scales location score linearly with distance', () => {
    const halfDistance = DEFAULT_SCORING_CONFIG.maxDistanceKm / 2;
    expect(service.calcPlaceScore(halfDistance)).toBe(DEFAULT_SCORING_CONFIG.locationPoints / 2);
  });

  it('stops location scoring after the max distance', () => {
    expect(service.calcPlaceScore(DEFAULT_SCORING_CONFIG.maxDistanceKm + 1000)).toBe(0);
  });

  it('sums year and place scores in total', () => {
    const total = service.getTotalScore(2000, 2000, 0);
    expect(total).toBe(DEFAULT_SCORING_CONFIG.yearPoints + DEFAULT_SCORING_CONFIG.locationPoints);
  });
});
