// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS-eh233odeYfh3GFoce_iz09B7Fq4xvs",
  authDomain: "chatbot-10b06.firebaseapp.com",
  projectId: "chatbot-10b06",
  storageBucket: "chatbot-10b06.appspot.com",
  messagingSenderId: "605257561180",
  appId: "1:605257561180:web:5e16005d07295c84faa299",
  measurementId: "G-HZB5DJKYJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);