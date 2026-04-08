import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTests() {
    console.log("=== ATLAS E2E FIRESTORE PROTOCOL ===");
    
    try {
        console.log("\n[TEST 1] Logging in as standard citizen (kradletrained@gmail.com)...");
        const userCred = await signInWithEmailAndPassword(auth, 'kradletrained@gmail.com', 'empire1');
        const uid = userCred.user.uid;
        console.log("-> Success! UID:", uid);

        // Attempt to illegally modify our own stats
        console.log("\n[TEST 2] Attempting to hack own physical stat...");
        const myDocRef = doc(db, 'users', uid);
        try {
            await updateDoc(myDocRef, { physicalStat: 9999 });
            console.error("-> FAIL: Security breach! User was able to mutate their own stats.");
        } catch (e) {
            console.log("-> Success! Rules blocked illegal self-mutation.");
        }

        // The user ID for D2q0IIDPXXaXzVRhG1hFURv0Awe2 (or any other user, we'll try to find one or just use a dummy ID)
        console.log("\n[TEST 3] Testing correct P2P increment on another user...");
        // Since we don't know another user's exact UID dynamically easily, we'll try to update the admin's failedVerificationCount.
        // We'll log in as admin, get their UID, then switch back to user and verify.
    } catch(e) {
        console.error("E2E Test Failed:", e);
    }
    
    try {
        console.log("\n[TEST 4] Logging in as ADMIN (kdef2012@gmail.com)...");
        const adminCred = await signInWithEmailAndPassword(auth, 'kdef2012@gmail.com', 'empire1');
        const adminUid = adminCred.user.uid;
        console.log("-> Success! Admin UID:", adminUid);

        console.log("\n[TEST 5] Testing Admin override powers...");
        const myAdminRef = doc(db, 'users', adminUid);
        await updateDoc(myAdminRef, { updatedByAdminScript: true });
        console.log("-> Success! Admin is allowed full mutation rights.");

        console.log("\n[TEST 6] Switch back to Standard user to hit P2P Verification Rule...");
        await signInWithEmailAndPassword(auth, 'kradletrained@gmail.com', 'empire1');
        const adminTargetRef = doc(db, 'users', adminUid);
        
        try {
            await updateDoc(adminTargetRef, { physicalStat: 9999 });
            console.error("-> FAIL: Standard user was able to modify another user's stats!");
        } catch(e) {
             console.log("-> Blocked standard overwrite successfully.");
        }
        
        try {
            await updateDoc(adminTargetRef, { failedVerificationCount: increment(1) });
            console.log("-> Success! Target P2P Peer Verification rule correctly allowed increment.");
        } catch(e) {
            console.error("-> FAIL: Target rule blocked the P2P increment!", e.message);
        }

    } catch (e) {
        console.error("E2E Admin Block Failed:", e);
    }

    console.log("\n=== E2E DB PIPELINE TESTS COMPLETED ===");
    process.exit(0);
}

runTests();
