// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-b2d4c.firebaseapp.com",
  projectId: "vingo-food-delivery-b2d4c",
  storageBucket: "vingo-food-delivery-b2d4c.firebasestorage.app",
  messagingSenderId: "366986891825",
  appId: "1:366986891825:web:bd95244c077cb678f1bb10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth} 