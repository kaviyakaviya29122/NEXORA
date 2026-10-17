
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyDl0jrEjaTzfZQACikHf8SJC5BRmOpLIBo",
  authDomain: "nexora-fc1c5.firebaseapp.com",
  projectId: "nexora-fc1c5",
  storageBucket: "nexora-fc1c5.firebasestorage.app",
  messagingSenderId: "1060190043740",
  appId: "1:1060190043740:web:ac2b01a0c9f0ce3127f099",
  measurementId: "G-C6MNFQX27L"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("NEXORA Firebase connected!");

