import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMlJX_KBAwnUXyBo-UY88ajSMVrHxTUyI",
  authDomain: "armenu-73998.firebaseapp.com",
  databaseURL: "https://armenu-73998-default-rtdb.firebaseio.com",
  projectId: "armenu-73998",
  storageBucket: "armenu-73998.appspot.com",
  messagingSenderId: "93842579323",
  appId: "1:93842579323:web:2f05c981a858920d9fe7de",
  measurementId: "G-CPKKWB0H7C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
