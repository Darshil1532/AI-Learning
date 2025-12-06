/**
 * FIREBASE CONFIGURATION & INITIALIZATION
 */

const firebaseConfig = {
    apiKey: "AIzaSyDQEATMKwgeJ8NENP9S6pszNuyl39MvBlI",
    authDomain: "student-manager-4f421.firebaseapp.com",
    projectId: "student-manager-4f421",
    storageBucket: "student-manager-4f421.firebasestorage.app",
    messagingSenderId: "157476434588",
    appId: "1:157476434588:web:221fff5ad9ce43bd0af359",
    measurementId: "G-JS9E5XFLN8"
};

// Initialize Firebase
let app, auth, db;

try {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Enable Offline Persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Persistence failed: Multiple tabs open');
                } else if (err.code == 'unimplemented') {
                    console.warn('Persistence not supported by browser');
                }
            });

        console.log("Firebase Initialized Successfully");
    } else {
        console.error("Firebase SDK not loaded. Check your HTML script tags.");
    }
} catch (e) {
    console.error("Error initializing Firebase:", e);
}
