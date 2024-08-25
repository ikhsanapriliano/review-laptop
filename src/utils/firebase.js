import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB_CQkqwp_qmyAQkxFiatLwBDdW6ns2IFg",
    authDomain: "review-laptop.firebaseapp.com",
    projectId: "review-laptop",
    storageBucket: "review-laptop.appspot.com",
    messagingSenderId: "879659916828",
    appId: "1:879659916828:web:382b8047ce549495e5c9d9"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);