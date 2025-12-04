import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { TimePhoto } from '../models/time-photo.model';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  private dataUrl = 'assets/data/time-photos.json';
  private cache$?: Observable<TimePhoto[]>; // Cache pentru performanta

  constructor(private http: HttpClient) { }

  /**
   * Obtine toate fotografiile cu caching
   */
  getAllPhotos(): Observable<TimePhoto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<TimePhoto[]>(this.dataUrl).pipe(
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
