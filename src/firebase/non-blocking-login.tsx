
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate email/password sign-up. */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return await createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return await signInWithEmailAndPassword(authInstance, email, password);
}
