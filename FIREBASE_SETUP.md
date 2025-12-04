# Firebase Setup pentru TimeGuesser

## Pași pentru configurarea Firebase (Opțional)

Firebase oferă funcționalități serverless pentru:
- **Leaderboard global** - Clasament online cu top scoruri
- **Backup cloud** - Salvarea progresului în cloud
- **Sincronizare** - Acces la date de pe multiple dispozitive

### 1. Creează un proiect Firebase

1. Accesează [Firebase Console](https://console.firebase.google.com/)
2. Click pe "Add project" sau "Adaugă proiect"
3. Numește proiectul (ex: `timeguesser`)
4. Dezactivează Google Analytics (opțional)
5. Click "Create project"

### 2. Adaugă o aplicație web

1. În Firebase Console, click pe iconița Web `</>`
2. Numește app-ul (ex: `TimeGuesser Web`)
3. **NU** bifa "Set up Firebase Hosting" (deocamdată)
4. Click "Register app"

### 3. Copiază configurația

Firebase va afișa un cod similar cu:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "timeguesser-xxxxx.firebaseapp.com",
  projectId: "timeguesser-xxxxx",
  storageBucket: "timeguesser-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Actualizează fișierele environment

Copiază valorile în:
- `src/environments/environment.ts` (pentru development)
- `src/environments/environment.prod.ts` (pentru production)

Înlocuiește:
```typescript
firebase: {
  apiKey: "YOUR_API_KEY",           // <- Aici
  authDomain: "YOUR_PROJECT_ID...", // <- Aici
  // ... etc
}
```

### 5. Configurează Firestore Database

1. În Firebase Console, mergi la **Build > Firestore Database**
2. Click "Create database"
3. Alege "Start in **test mode**" (pentru dezvoltare)
   - Pentru production, vei configura reguli de securitate
4. Alege o locație (ex: `eur3` pentru Europa)
5. Click "Enable"

### 6. Configurează regulile Firestore (Opțional)

Pentru a permite citirea/scrierea datelor, mergi la **Rules** tab și folosește:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite citirea leaderboard-ului tuturor
    match /leaderboard/{document} {
      allow read: if true;
      allow write: if true; // Schimbă cu validări custom în producție
    }
    
    // Permite salvarea progresului
    match /gameProgress/{document} {
      allow read, write: if true; // Adaugă autentificare pentru producție
    }
  }
}
```

**⚠️ IMPORTANT:** Aceste reguli sunt permisive și bune pentru dezvoltare. Pentru producție, implementează autentificare și validări.

### 7. Testează integrarea

După configurare, rulează aplicația:
```bash
npm start
```

Verifică consola browser-ului pentru:
- ✅ "Firebase inițializat cu succes" - totul funcționează
- ⚠️ "Firebase nu este configurat" - trebuie să actualizezi environment.ts

## Funcționalități disponibile

### A. Salvare scor în leaderboard

```typescript
// În componenta de joc
constructor(private scoreService: ScoreService) {}

async finishGame() {
  await this.scoreService.saveScore({
    playerName: 'Player1',
    score: 8500,
    totalRounds: 5,
    gameMode: 'timed'
  });
}
```

### B. Afișare top scoruri

```typescript
async loadLeaderboard() {
  const topScores = await this.scoreService.getTopScores('timed', 10);
  console.log(topScores);
}
```

### C. Statistici

```typescript
const stats = await this.scoreService.getScoreStats('relaxed');
console.log(`Best score: ${stats.bestScore}`);
```

## Fallback pe localStorage

**Aplicația funcționează și FĂRĂ Firebase!** 

Dacă Firebase nu este configurat, toate datele se salvează local în browser (localStorage). Aceasta înseamnă:
- ✅ Jocul funcționează offline
- ✅ Scorurile se păstrează între sesiuni
- ❌ Nu există leaderboard global
- ❌ Datele se pierd dacă ștergi cache-ul browser-ului

## Troubleshooting

**Eroare: "Firebase nu este configurat"**
- Verifică că ai actualizat `environment.ts` cu valorile corecte
- Asigură-te că nu ai lăsat "YOUR_API_KEY"

**Eroare: "Permission denied"**
- Verifică regulile Firestore în Firebase Console
- Asigură-te că ai enabled Firestore Database

**Scorurile nu apar**
- Verifică consola browser pentru erori
- Mergi în Firebase Console > Firestore > leaderboard collection
- Verifică că există documente salvate

## Securitate în Producție

Pentru deployment în producție:

1. **Implementează autentificare** (Firebase Auth)
2. **Validează datele** în Firestore Rules
3. **Rate limiting** pentru preveni spam
4. **Verifică numele jucătorilor** (anti-profanity)

Exemplu reguli sigure:
```
match /leaderboard/{document} {
  allow read: if true;
  allow create: if request.auth != null 
    && request.resource.data.score is number
    && request.resource.data.score >= 0
    && request.resource.data.score <= 10000;
}
```

## Costuri

Firebase oferă un **tier gratuit generos**:
- 50,000 citiri/zi
- 20,000 scrieri/zi
- 1GB stocare

Pentru TimeGuesser, ar trebui să fie suficient pentru mii de jucători lunar.
