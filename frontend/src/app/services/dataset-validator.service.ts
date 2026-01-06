import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TimePhoto } from '../models/time-photo.model';

export interface DatasetValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        totalPhotos: number;
        byDifficulty: { easy: number; medium: number; hard: number };
        yearRange: { min: number; max: number };
    };
}

@Injectable({
    providedIn: 'root'
})
export class DatasetValidatorService {

    constructor(private http: HttpClient) { }


    validateDataset(dataUrl: string = 'assets/data/time-photos.json'): Observable<DatasetValidationResult> {
        return this.http.get<TimePhoto[]>(dataUrl).pipe(
            map(photos => this.performValidation(photos))
        );
    }

    private performValidation(photos: TimePhoto[]): DatasetValidationResult {
        const result: DatasetValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            stats: {
                totalPhotos: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 },
                yearRange: { min: Infinity, max: -Infinity }
            }
        };

        if (!Array.isArray(photos)) {
            result.errors.push('Dataset must be an array');
            result.valid = false;
            return result;
        }

        result.stats.totalPhotos = photos.length;

        if (photos.length === 0) {
            result.errors.push('Dataset is empty');
            result.valid = false;
            return result;
        }

        const usedIds = new Set<string>();

        photos.forEach((photo, index) => {
            const photoRef = `Photo ${index + 1} (${photo.id || 'no-id'})`;

            //  ID-uri unice
            if (!photo.id) {
                result.errors.push(`${photoRef}: Missing ID`);
                result.valid = false;
            } else if (usedIds.has(photo.id)) {
                result.errors.push(`${photoRef}: Duplicate ID '${photo.id}'`);
                result.valid = false;
            } else {
                usedIds.add(photo.id);
            }

            //  campuri obligatorii
            if (!photo.imageUrl) {
                result.errors.push(`${photoRef}: Missing imageUrl`);
                result.valid = false;
            }

            if (typeof photo.year !== 'number') {
                result.errors.push(`${photoRef}: Invalid year`);
                result.valid = false;
            } else {
                if (photo.year < 1800 || photo.year > 2024) {
                    result.warnings.push(`${photoRef}: Year ${photo.year} outside range 1800-2024`);
                }
                result.stats.yearRange.min = Math.min(result.stats.yearRange.min, photo.year);
                result.stats.yearRange.max = Math.max(result.stats.yearRange.max, photo.year);
            }

            //  coordonate
            if (typeof photo.lat !== 'number' || photo.lat < -90 || photo.lat > 90) {
                result.errors.push(`${photoRef}: Invalid latitude (${photo.lat})`);
                result.valid = false;
            }

            if (typeof photo.lng !== 'number' || photo.lng < -180 || photo.lng > 180) {
                result.errors.push(`${photoRef}: Invalid longitude (${photo.lng})`);
                result.valid = false;
            }

            if (!photo.country) {
                result.errors.push(`${photoRef}: Missing country`);
                result.valid = false;
            }

            //  difficulty
            if (photo.difficulty) {
                if (!['easy', 'medium', 'hard'].includes(photo.difficulty)) {
                    result.warnings.push(`${photoRef}: Invalid difficulty '${photo.difficulty}'`);
                } else {
                    result.stats.byDifficulty[photo.difficulty]++;
                }
            } else {
                result.warnings.push(`${photoRef}: Missing difficulty`);
            }

            // Avertismente pentru campuri optionale utile
            if (!photo.description) {
                result.warnings.push(`${photoRef}: Missing description (useful for hints)`);
            }

            if (!photo.tags || photo.tags.length === 0) {
                result.warnings.push(`${photoRef}: Missing tags (useful for filtering)`);
            }
        });

        // Verifica distributia echilibrata
        const { easy, medium, hard } = result.stats.byDifficulty;
        if (easy === 0 || medium === 0 || hard === 0) {
            result.warnings.push('Unbalanced difficulty distribution');
        }

        return result;
    }


    logValidationResult(result: DatasetValidationResult): void {
        console.group('📊 Dataset Validation Results');

        console.log('Statistics:', result.stats);

        if (result.errors.length > 0) {
            console.group('❌ Errors:');
            result.errors.forEach(error => console.error(error));
            console.groupEnd();
        }

        if (result.warnings.length > 0) {
            console.group('⚠️ Warnings:');
            result.warnings.forEach(warning => console.warn(warning));
            console.groupEnd();
        }

        console.log(result.valid ? '✅ Valid' : '❌ Invalid');
        console.groupEnd();
    }
}
