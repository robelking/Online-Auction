import * as firebase from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCrI4zziRyzKRCdhX8_yC2fohWAonyDBLk",
    authDomain: "onlineauction-b2d55.firebaseapp.com",
    projectId: "onlineauction-b2d55",
    storageBucket: "onlineauction-b2d55.appspot.com",
    messagingSenderId: "413742315650",
    appId: "1:413742315650:web:962f17053286575a3d9c9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export default firebase