// Firebase configuration EXAMPLE
// Copy this file as environment.ts and environment.prod.ts
// Then fill in with your values from Firebase Console

export const environment = {
    production: false, // true pentru environment.prod.ts
    firebase: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    }
};

// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and select Web app
// 5. Copy the firebaseConfig object here
