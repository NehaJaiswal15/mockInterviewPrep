// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCvhGc-1zl7l0CX5iRvvLVZiS34wGmNIRQ",
    authDomain: "prepwise-23e6c.firebaseapp.com",
    projectId: "prepwise-23e6c",
    storageBucket: "prepwise-23e6c.firebasestorage.app",
    messagingSenderId: "1045156985177",
    appId: "1:1045156985177:web:ee63e29466498c23f9b448",
    measurementId: "G-15755249LF"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();

export const auth = getAuth(app);
export const db = getFirestore(app)