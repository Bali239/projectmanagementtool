"use client"

import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import GoogleAuthFlow from "./GoogleAuthFlow"

export default function LoginForm() {
  return <AuthPageLayout mode="login">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Sign in securely with your Google account.</p>
      <GoogleAuthFlow />
      <p className="mt-6 text-center text-sm text-slate-500">New to LetsDo? Google sign-in creates your account automatically.</p>
    </AuthCard>
  </AuthPageLayout>
}
