# TimeGuesser 🌍⏰

Un joc interactiv de ghicit anul și locația fotografiilor istorice, inspirat de GeoGuessr.

## 📋 Despre Proiect

TimeGuesser este o aplicație web educativă care testează cunoștințele tale despre istorie și geografie. Jucătorii trebuie să ghicească:
- **Anul** în care a fost făcută fotografia
- **Locația geografică** pe hartă

### Moduri de Joc

- **Relaxed Mode** ☕ - Fără limită de timp, perfect pentru explorare
- **Speed Run Mode** ⏱️ - 60 secunde pe rundă pentru un challenge intens

## 🚀 Tehnologii Utilizate

- **Frontend:** Angular 20 (standalone components)
- **Stilizare:** CSS custom (responsive design)
- **Date:** JSON local + Firebase (opțional)
- **Hartă:** Leaflet/Google Maps (în dezvoltare)
- **TypeScript:** 5.9.2

## 📂 Structură Proiect

```
TimeGuesser/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Componente Angular
│   │   │   │   ├── home/         # Ecran home
│   │   │   │   ├── settings/     # Selectare mod joc
│   │   │   │   └── game/         # Componenta principală de joc
│   │   │   ├── models/           # Interfețe TypeScript
│   │   │   └── services/         # Servicii (dataset, Firebase, scoring)
│   │   └── assets/
│   │       ├── data/             # time-photos.json
│   │       └── images/           # Fotografii istorice
│   └── scripts/                  # Script validare dataset
├── FIREBASE_SETUP.md             # Ghid configurare Firebase
└── README.md
```

## 🎮 Instalare și Rulare

### Prerequisite
- Node.js 18+ și npm
- Git

### Pași

1. **Clone repository:**
```bash
git clone https://github.com/Aleee2601/TimeGuesser.git
cd TimeGuesser/frontend
```

2. **Instalează dependențele:**
```bash
npm install
```

3. **Rulează aplicația:**
```bash
npm start
```

4. **Deschide în browser:**
```
http://localhost:4200
```

## 🔥 Configurare Firebase (Opțional)

Pentru leaderboard global și sincronizare cloud, vezi ghidul detaliat: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

**Aplicația funcționează FĂRĂ Firebase** - datele se salvează local în browser.

## 📊 Dataset

Proiectul include 8 fotografii istorice din perioada 1865-2024:

**Dificultate Easy:**
- 1989 - Căderea Zidului Berlinului
- 1969 - Apollo 11 Moon Landing
- 2001 - 9/11 Attacks

**Dificultate Medium:**
- 1963 - March on Washington
- 1912 - RMS Titanic
- 1986 - Chernobyl Disaster

**Dificultate Hard:**
- 1906 - San Francisco Earthquake
- 1865 - End of American Civil War

### Validare Dataset

```bash
npm run validate-dataset
```

Verifică:
- ✅ Existența imaginilor
- ✅ Coordonate geografice valide
- ✅ Ani în intervalul corect
- ✅ ID-uri unice

## 🛠️ Comenzi Disponibile

```bash
npm start              # Rulează dev server
npm run build          # Build pentru producție
npm test               # Rulează teste
npm run validate-dataset  # Validează dataset-ul
```

## 🎯 Funcționalități Implementate

### ✅ Completate
- [x] Routing (Home → Settings → Game)
- [x] UI responsive (desktop + mobile)
- [x] Loading fotografii din JSON
- [x] Selectare mod de joc
- [x] Model de date extins
- [x] DatasetService cu caching și filtrare
- [x] Script validare dataset
- [x] Integrare Firebase (opțională)
- [x] LocalStorage fallback
- [x] ScoreService hibrid

### 🚧 În Dezvoltare
- [ ] Hartă interactivă (Leaflet)
- [ ] Logică scoring completă
- [ ] Timer funcțional pentru Speed Run
- [ ] Ecran rezultate finale
- [ ] Animații tranziție între runde
- [ ] Componentă leaderboard

## 📈 Sistem de Scoring

Punctajul se calculează pe baza a doi factori:

1. **Precizia anului:** Max 500 puncte
   - Diferență 0 ani = 500 puncte
   - Scade proportional până la 100 ani diferență

2. **Precizia locației:** Max 500 puncte
   - Distanță 0 km = 500 puncte
   - Scade proportional până la 20,000 km

**Scor maxim pe rundă:** 1000 puncte  
**Scor maxim total (5 runde):** 5000 puncte

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru a adăuga fotografii noi:

1. Adaugă imaginea în `frontend/src/assets/images/time-photos/`
2. Actualizează `time-photos.json` cu metadatele
3. Rulează `npm run validate-dataset`
4. Trimite un Pull Request

### Format JSON pentru fotografii noi:
```json
{
  "id": "photo_XXX",
  "imageUrl": "assets/images/time-photos/photo_XXX.jpg",
  "year": 1969,
  "lat": 28.5728,
  "lng": -80.6490,
  "country": "United States",
  "city": "Cape Kennedy",
  "description": "Apollo 11 Moon landing",
  "tags": ["space", "historic"],
  "difficulty": "easy",
  "source": "NASA"
}
```

## 📝 Licență

Acest proiect este open-source și disponibil sub licența MIT.

## 👥 Autori

- **Maria** - [@Aleee2601](https://github.com/Aleee2601)

## 🙏 Mulțumiri

- Fotografii din domeniul public
- NASA pentru imagini spațiale
- Comunitatea Angular

---

**Enjoy playing TimeGuesser! 🎉**