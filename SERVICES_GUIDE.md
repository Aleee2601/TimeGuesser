# Ghid de Utilizare - Servicii TimeGuesser

## 📚 Servicii Disponibile

### 1. DatasetService
Gestionează încărcarea și filtrarea fotografiilor.

```typescript
import { DatasetService } from './services/dataset.service';

constructor(private datasetService: DatasetService) {}

// Obține toate fotografiile
this.datasetService.getAllPhotos().subscribe(photos => {
  console.log(photos);
});

// Obține o fotografie random
this.datasetService.getRandomPhoto().subscribe(photo => {
  console.log(photo);
});

// Obține 5 fotografii random pentru un joc
this.datasetService.getRandomPhotos(5).subscribe(photos => {
  console.log(photos);
});

// Filtrare după dificultate
this.datasetService.getPhotosByDifficulty('easy').subscribe(photos => {
  console.log('Easy photos:', photos);
});

// Filtrare după tag
this.datasetService.getPhotosByTag('war').subscribe(photos => {
  console.log('War photos:', photos);
});

// Statistici dataset
this.datasetService.getDatasetStats().subscribe(stats => {
  console.log('Total photos:', stats.total);
  console.log('Difficulty distribution:', stats.byDifficulty);
});
```

### 2. ScoreService
Gestionează salvarea și afișarea scorurilor (Firebase + localStorage).

```typescript
import { ScoreService } from './services/score.service';

constructor(private scoreService: ScoreService) {}

// Salvează scor la finalul jocului
async saveGameScore() {
  await this.scoreService.saveScore({
    playerName: 'Maria',
    score: 4250,
    totalRounds: 5,
    gameMode: 'timed'
  });
  console.log('Score saved!');
}

// Afișează top 10 scoruri
async showLeaderboard() {
  const topScores = await this.scoreService.getTopScores('timed', 10);
  topScores.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.playerName}: ${entry.score} points`);
  });
}

// Statistici scoruri
async showStats() {
  const stats = await this.scoreService.getScoreStats('relaxed');
  console.log('Average score:', stats.averageScore);
  console.log('Best score:', stats.bestScore);
}

// Verifică dacă un scor e în top 10
async checkIfTopScore(myScore: number) {
  const isTop = await this.scoreService.isTopScore(myScore, 'timed');
  if (isTop) {
    console.log('Congratulations! You made it to the top 10!');
  }
}
```

### 3. FirebaseService
Integrare directă cu Firebase (folosit de ScoreService).

```typescript
import { FirebaseService } from './services/firebase.service';

constructor(private firebaseService: FirebaseService) {}

// Verifică dacă Firebase e disponibil
if (this.firebaseService.isAvailable()) {
  console.log('Firebase is ready!');
} else {
  console.log('Using local storage fallback');
}

// Salvează progres
await this.firebaseService.saveGameProgress('user123', {
  currentRound: 3,
  score: 2100,
  photos: [...]
});
```

### 4. LocalStorageService
Salvare locală (fallback automat).

```typescript
import { LocalStorageService } from './services/local-storage.service';

constructor(private localStorage: LocalStorageService) {}

// Salvează progres local
this.localStorage.saveProgress({
  round: 3,
  score: 1500
});

// Recuperează progres
const progress = this.localStorage.getProgress();

// Salvează setări
this.localStorage.saveSettings({
  soundEnabled: true,
  difficulty: 'medium'
});

// Șterge date
this.localStorage.clearAll();
```

### 5. DatasetValidatorService
Validare runtime în browser.

```typescript
import { DatasetValidatorService } from './services/dataset-validator.service';

constructor(private validator: DatasetValidatorService) {}

ngOnInit() {
  this.validator.validateDataset().subscribe(result => {
    this.validator.logValidationResult(result);
    
    if (result.valid) {
      console.log('Dataset is valid! ✅');
    } else {
      console.error('Dataset has errors:', result.errors);
    }
  });
}
```

## 🎮 Exemplu Complet - GameComponent

```typescript
import { Component, OnInit } from '@angular/core';
import { DatasetService } from '../../services/dataset.service';
import { ScoreService } from '../../services/score.service';
import { TimePhoto } from '../../models/time-photo.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  photos: TimePhoto[] = [];
  currentRound: number = 0;
  totalScore: number = 0;
  gameMode: 'relaxed' | 'timed' = 'relaxed';

  constructor(
    private datasetService: DatasetService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.startNewGame();
  }

  async startNewGame() {
    // Încarcă 5 fotografii random
    this.datasetService.getRandomPhotos(5).subscribe(photos => {
      this.photos = photos;
      this.currentRound = 0;
      this.totalScore = 0;
    });
  }

  async submitGuess(guessedYear: number, lat: number, lng: number) {
    const currentPhoto = this.photos[this.currentRound];
    
    // Calculează scor (exemplu simplificat)
    const yearDiff = Math.abs(currentPhoto.year - guessedYear);
    const score = Math.max(0, 500 - yearDiff * 5);
    
    this.totalScore += score;
    this.currentRound++;

    // Verifică sfârșitul jocului
    if (this.currentRound >= this.photos.length) {
      await this.endGame();
    }
  }

  async endGame() {
    // Salvează scorul
    await this.scoreService.saveScore({
      playerName: prompt('Enter your name:') || 'Anonymous',
      score: this.totalScore,
      totalRounds: this.photos.length,
      gameMode: this.gameMode
    });

    // Verifică dacă e top score
    const isTop = await this.scoreService.isTopScore(
      this.totalScore, 
      this.gameMode
    );

    if (isTop) {
      alert('🎉 New high score!');
    }

    // Afișează leaderboard
    const topScores = await this.scoreService.getTopScores(this.gameMode, 5);
    console.log('Top 5 Scores:', topScores);
  }
}
```

## 🔥 Firebase vs localStorage

| Feature | Firebase | localStorage |
|---------|----------|--------------|
| Leaderboard global | ✅ | ❌ (doar local) |
| Sincronizare device-uri | ✅ | ❌ |
| Offline support | ✅ | ✅ |
| Persistență date | ✅ Permanent | ⚠️ Se șterge cu cache |
| Setup necesar | ✅ Configurare | ❌ Funcționează direct |
| Limită de date | 1GB gratuit | ~5-10MB |

## 💡 Best Practices

1. **Folosește ScoreService**, nu direct Firebase/localStorage
2. **Verifică availability** înainte de operații critice
3. **Handle errors** cu try-catch pentru operații async
4. **Validează input** înainte de salvare
5. **Cache rezultate** pentru performance

## 🐛 Debugging

```typescript
// Activează logging detaliat
localStorage.setItem('debug', 'true');

// Verifică ce date sunt în localStorage
console.log(localStorage.getItem('timeguesser_leaderboard'));

// Șterge toate datele locale
this.scoreService.clearLocalScores();

// Verifică status Firebase
console.log('Firebase available:', this.firebaseService.isAvailable());
```
