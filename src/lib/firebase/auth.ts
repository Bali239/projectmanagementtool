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
    "auth/invalid-email": "Enter a valid email address.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Use a stronger password with at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Check your internet connection and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before completing.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow popups and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled for the project.",
  }

  return messages[code] ?? "Something went wrong. Please try again."
}