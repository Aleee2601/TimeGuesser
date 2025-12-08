import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, of, shareReplay } from 'rxjs';
import { TimePhoto } from '../models/time-photo.model';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  private dataUrl = 'assets/data/time-photos.json';
  private cache$?: Observable<TimePhoto[]>; // Cache pentru performanta
  private sourceSubject = new BehaviorSubject<'primary' | 'fallback'>('primary');
  readonly dataSource$ = this.sourceSubject.asObservable();

  private readonly fallbackPhotos: TimePhoto[] = [
    {
      id: 'fallback-1',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      year: 1990,
      lat: 40.758,
      lng: -73.9855,
      country: 'USA',
      city: 'New York',
      description: 'Times Square lights up in the 90s.',
      tags: ['city', 'culture'],
      difficulty: 'easy'
    },
    {
      id: 'fallback-2',
      imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
      year: 1965,
      lat: 48.8566,
      lng: 2.3522,
      country: 'France',
      city: 'Paris',
      description: 'A quiet Parisian street scene.',
      tags: ['city'],
      difficulty: 'medium'
    },
    {
      id: 'fallback-3',
      imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
      year: 1880,
      lat: 51.5072,
      lng: -0.1276,
      country: 'United Kingdom',
      city: 'London',
      description: 'Vintage London bridge view.',
      tags: ['history', 'bridge'],
      difficulty: 'hard'
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtine toate fotografiile cu caching
   */
  getAllPhotos(): Observable<TimePhoto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<TimePhoto[]>(this.dataUrl).pipe(
        catchError(error => {
          console.warn('Dataset unavailable, using fallback set.', error);
          this.sourceSubject.next('fallback');
          return of(this.fallbackPhotos);
        }),
        map(photos => {
          if (!Array.isArray(photos) || photos.length === 0) {
            console.warn('Dataset missing or empty. Switching to fallback set.');
            this.sourceSubject.next('fallback');
            return this.fallbackPhotos;
          }
          this.sourceSubject.next('primary');
          return photos;
        }),
        shareReplay(1) // Cache rezultatul
      );
    }
    return this.cache$;
  }

  /**
   * Obtine o fotografie random
   */
  getRandomPhoto(): Observable<TimePhoto> {
    return this.getAllPhotos().pipe(
      map(photos => {
        const randomIndex = Math.floor(Math.random() * photos.length);
        return photos[randomIndex];
      })
    );
  }

  /**
   * Obtine multiple fotografii random unice pentru o sesiune
   * @param count Numarul de fotografii dorit
   */
  getRandomPhotos(count: number): Observable<TimePhoto[]> {
    return this.getAllPhotos().pipe(
      map(photos => {
        const shuffled = [...photos].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, photos.length));
      })
    );
  }

  /**
   * Get photo by ID
   */
  getPhotoById(id: string): Observable<TimePhoto | undefined> {
    return this.getAllPhotos().pipe(
      map(photos => photos.find(p => p.id === id))
    );
  }

  /**
   * Filter photos by difficulty
   */
  getPhotosByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Observable<TimePhoto[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(p => p.difficulty === difficulty))
    );
  }

  /**
   * Filter photos by tag
   */
  getPhotosByTag(tag: string): Observable<TimePhoto[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(p => p.tags?.includes(tag)))
    );
  }

  /**
   * Obtine fotografii dintr-un interval de ani
   */
  getPhotosByYearRange(startYear: number, endYear: number): Observable<TimePhoto[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(p => p.year >= startYear && p.year <= endYear))
    );
  }

  /**
   * Obtine toate tag-urile unice
   */
  getAllTags(): Observable<string[]> {
    return this.getAllPhotos().pipe(
      map(photos => {
        const allTags = photos.flatMap(p => p.tags || []);
        return [...new Set(allTags)].sort();
      })
    );
  }

  /**
   * Obtine statistici despre dataset
   */
  getDatasetStats(): Observable<{
    total: number;
    byDifficulty: { easy: number; medium: number; hard: number };
    yearRange: { min: number; max: number };
    countries: number;
  }> {
    return this.getAllPhotos().pipe(
      map(photos => {
        const years = photos.map(p => p.year);
        const countries = new Set(photos.map(p => p.country));

        return {
          total: photos.length,
          byDifficulty: {
            easy: photos.filter(p => p.difficulty === 'easy').length,
            medium: photos.filter(p => p.difficulty === 'medium').length,
            hard: photos.filter(p => p.difficulty === 'hard').length,
          },
          yearRange: {
            min: Math.min(...years),
            max: Math.max(...years)
          },
          countries: countries.size
        };
      })
    );
  }

  /**
   * Reseteaza cache-ul (util pentru testing sau refresh manual)
   */
  clearCache(): void {
    this.cache$ = undefined;
  }
}
