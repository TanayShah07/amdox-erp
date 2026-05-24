import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDe3LKFfxwZQz7DcID-5uSLDgIngEYgcTM",
  authDomain: "amdox-erp-7849c.firebaseapp.com",
  projectId: "amdox-erp-7849c",
  storageBucket: "amdox-erp-7849c.firebasestorage.app",
  messagingSenderId: "9491093397",
  appId: "1:9491093397:web:ece38a9449358d24d3889",
  measurementId: "G-BYBBKX2RLE",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();