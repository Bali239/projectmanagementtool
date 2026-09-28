import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { getFirebaseAuth } from "./client"

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function loginWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
}

export async function signupWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  await updateProfile(credential.user, { displayName: name })
  return credential
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(getFirebaseAuth(), email)
}

export async function logout() {
  return signOut(getFirebaseAuth())
}

export function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : ""

  const messages: Record<string, string> = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/email-already-in-use": "An account already uses this email. Sign in with Google first, then add a password to use both sign-in methods.",
    "auth/weak-password": "Choose a stronger password that meets all the requirements.",
    "auth/credential-already-in-use": "This email already has a password account. Sign in to that account first to connect your sign-in methods.",
    "auth/account-exists-with-different-credential": "This email already has an account with another sign-in method. Sign in with that method first.",
    "auth/provider-already-linked": "A password is already connected to this account. Sign in with your email and password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Check your internet connection and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before completing.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow popups and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled for the project.",
    "auth/requires-recent-login": "For your security, sign in again and retry this change.",
  }

  return messages[code] ?? (error instanceof Error && !code ? error.message : "Something went wrong. Please try again.")
}
