import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYfNPUEJYFMQswP7bUiMUWrtzHeyGhubk",
  authDomain: "sravanistore-d61ed.firebaseapp.com",
  projectId: "sravanistore-d61ed",
  storageBucket: "sravanistore-d61ed.firebasestorage.app",
  messagingSenderId: "1046290438281",
  appId: "1:1046290438281:web:a60350b8d5f583cb2a4e58",
  measurementId: "G-X5CMYFK07J",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
  }),
});
export const storage = getStorage(app);
