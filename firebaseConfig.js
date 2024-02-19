import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } from '@env'

//Initialize Firebase
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;