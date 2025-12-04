/**
 * Script de validare pentru dataset-ul TimeGuesser
 * Rulează cu: npm run validate-dataset
 * 
 * Note: Acest script folosește module Node.js (fs, path, url).
 * IDE-ul poate afișa erori, dar scriptul funcționează corect când rulează cu ts-node.
 */

// @ts-ignore - Node.js modules
import { readFileSync, existsSync } from 'fs';
// @ts-ignore - Node.js modules
import { join, dirname } from 'path';
// @ts-ignore - Node.js modules
import { fileURLToPath } from 'url';

// @ts-ignore - ES modules meta
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TimePhoto {
    id: string;
    imageUrl: string;
    year: number;
    lat: number;
    lng: number;
    country: string;
    city?: string;
    description?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    source?: string;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        totalPhotos: number;
        byDifficulty: { easy: number; medium: number; hard: number };
        yearRange: { min: number; max: number };
        missingImages: number;
    };
}

const DATASET_PATH = join(__dirname, '../src/assets/data/time-photos.json');
const IMAGES_DIR = join(__dirname, '../src/assets/images/time-photos');

function validateDataset(): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        stats: {
            totalPhotos: 0,
            byDifficulty: { easy: 0, medium: 0, hard: 0 },
            yearRange: { min: Infinity, max: -Infinity },
            missingImages: 0
        }
    };

    // 1. Verifică dacă fișierul JSON există
    if (!existsSync(DATASET_PATH)) {
        result.errors.push(`Dataset file not found: ${DATASET_PATH}`);
        result.valid = false;
        return result;
    }

    // 2. Încarcă și parsează JSON-ul
    let photos: TimePhoto[];
    try {
        const jsonContent = readFileSync(DATASET_PATH, 'utf-8');
        photos = JSON.parse(jsonContent);
    } catch (error) {
        result.errors.push(`Failed to parse JSON: ${error}`);
        result.valid = false;
        return result;
    }    // 3. Verifică dacă este array
    if (!Array.isArray(photos)) {
        result.errors.push('Dataset must be an array');
        result.valid = false;
        return result;
    }

    result.stats.totalPhotos = photos.length;

    // 4. Verifică fiecare fotografie
    const usedIds = new Set<string>();

    photos.forEach((photo, index) => {
        const photoRef = `Photo ${index + 1} (${photo.id || 'no-id'})`;

        // Verifică câmpuri obligatorii
        if (!photo.id) {
            result.errors.push(`${photoRef}: Missing required field 'id'`);
            result.valid = false;
        } else if (usedIds.has(photo.id)) {
            result.errors.push(`${photoRef}: Duplicate ID '${photo.id}'`);
            result.valid = false;
        } else {
            usedIds.add(photo.id);
        }

        if (!photo.imageUrl) {
            result.errors.push(`${photoRef}: Missing required field 'imageUrl'`);
            result.valid = false;
        } else {
            // Verifică dacă imaginea există
            const imagePath = join(__dirname, '..', 'src', photo.imageUrl);
            if (!existsSync(imagePath)) {
                result.errors.push(`${photoRef}: Image file not found: ${photo.imageUrl}`);
                result.stats.missingImages++;
                result.valid = false;
            }
        } if (typeof photo.year !== 'number') {
            result.errors.push(`${photoRef}: Missing or invalid 'year' field`);
            result.valid = false;
        } else {
            // Verifică interval de ani (1800-2024)
            if (photo.year < 1800 || photo.year > 2024) {
                result.warnings.push(`${photoRef}: Year ${photo.year} is outside recommended range (1800-2024)`);
            }
            result.stats.yearRange.min = Math.min(result.stats.yearRange.min, photo.year);
            result.stats.yearRange.max = Math.max(result.stats.yearRange.max, photo.year);
        }

        if (typeof photo.lat !== 'number') {
            result.errors.push(`${photoRef}: Missing or invalid 'lat' field`);
            result.valid = false;
        } else if (photo.lat < -90 || photo.lat > 90) {
            result.errors.push(`${photoRef}: Latitude ${photo.lat} is out of valid range (-90 to 90)`);
            result.valid = false;
        }

        if (typeof photo.lng !== 'number') {
            result.errors.push(`${photoRef}: Missing or invalid 'lng' field`);
            result.valid = false;
        } else if (photo.lng < -180 || photo.lng > 180) {
            result.errors.push(`${photoRef}: Longitude ${photo.lng} is out of valid range (-180 to 180)`);
            result.valid = false;
        }

        if (!photo.country) {
            result.errors.push(`${photoRef}: Missing required field 'country'`);
            result.valid = false;
        }

        // Verifică câmpuri opționale
        if (photo.difficulty) {
            if (!['easy', 'medium', 'hard'].includes(photo.difficulty)) {
                result.warnings.push(`${photoRef}: Invalid difficulty '${photo.difficulty}', should be 'easy', 'medium', or 'hard'`);
            } else {
                result.stats.byDifficulty[photo.difficulty]++;
            }
        } else {
            result.warnings.push(`${photoRef}: Missing 'difficulty' field`);
        }

        if (!photo.description) {
            result.warnings.push(`${photoRef}: Missing 'description' field (helpful for hints)`);
        }

        if (!photo.tags || photo.tags.length === 0) {
            result.warnings.push(`${photoRef}: Missing 'tags' field (helpful for categorization)`);
        }
    });

    // 5. Verifică distribuția dificultăților
    const { easy, medium, hard } = result.stats.byDifficulty;
    if (easy === 0 && medium === 0 && hard === 0) {
        result.warnings.push('No photos have difficulty set');
    } else if (easy === 0 || medium === 0 || hard === 0) {
        result.warnings.push('Unbalanced difficulty distribution (some difficulties have 0 photos)');
    }

    return result;
}

// Rulează validarea
console.log('🔍 Validating TimeGuesser Dataset...\n');
console.log('='.repeat(60));

const result = validateDataset();

// Afișează statistici
console.log('\n📊 STATISTICS:');
console.log('-'.repeat(60));
console.log(`Total photos: ${result.stats.totalPhotos}`);
console.log(`Year range: ${result.stats.yearRange.min} - ${result.stats.yearRange.max}`);
console.log(`Difficulty distribution:`);
console.log(`  - Easy: ${result.stats.byDifficulty.easy}`);
console.log(`  - Medium: ${result.stats.byDifficulty.medium}`);
console.log(`  - Hard: ${result.stats.byDifficulty.hard}`);
console.log(`Missing images: ${result.stats.missingImages}`);

// Afișează erori
if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    console.log('-'.repeat(60));
    result.errors.forEach(error => console.log(`  • ${error}`));
}

// Afișează avertismente
if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    console.log('-'.repeat(60));
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
}

// Rezultat final
console.log('\n' + '='.repeat(60));
if (result.valid) {
    console.log('✅ VALIDATION PASSED - Dataset is valid!');
    process.exit(0);
} else {
    console.log('❌ VALIDATION FAILED - Please fix the errors above');
    process.exit(1);
}
