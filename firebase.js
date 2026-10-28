
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyA4kaTteTE4A68vjBPtWf5yj_0EV_ew8A",
authDomain: "nexus-360-30fb7.firebaseapp.com",
projectId: "nexus-360-30fb7",
storageBucket: "nexus-360-30fb7.firebasestorage.app",
messagingSenderId: "822196764774",
appId: "1:822196764774:web:752ddb118b6f9d8232eda7",
measurementId: "G-RQ9Z9C8LSW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
