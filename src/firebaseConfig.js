import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDCvDgQ2rqv3zsxO123kggxuSieFp4QX1Q",
  authDomain: "web-vida-fa009.firebaseapp.com",
  projectId: "web-vida-fa009",
  storageBucket: "web-vida-fa009.firebasestorage.app",
  messagingSenderId: "970454244747",
  appId: "1:970454244747:web:932ca16cc3c80f3a89a38e",
  measurementId: "G-5547C0LF74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, get };
