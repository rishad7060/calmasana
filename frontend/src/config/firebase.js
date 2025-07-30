import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAmtSs4GrmaYDtO5kgP_vHltIgOpC_UtXg",
  authDomain: "calmasana-dc908-f38bb.firebaseapp.com",
  projectId: "calmasana-dc908-f38bb",
  storageBucket: "calmasana-dc908-f38bb.firebasestorage.app",
  messagingSenderId: "856802823592",
  appId: "1:856802823592:web:7cfada093d7c9e3ff9e19d",
  measurementId: "G-8FYDDBNZLL"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app