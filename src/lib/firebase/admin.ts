import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

let adminAuth: Auth | undefined

function getAdminApp() {
  if (getApps().length) return getApp()

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (clientEmail && privateKey && projectId) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    })
  }

  return initializeApp({ credential: applicationDefault(), projectId })
}

export function getFirebaseAdminAuth() {
  if (!adminAuth) adminAuth = getAuth(getAdminApp())
  return adminAuth
}