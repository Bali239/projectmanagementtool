"use client"

import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import GoogleAuthFlow from "./GoogleAuthFlow"

export default function SignupForm() {
  return <AuthPageLayout mode="signup">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create your workspace</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Create your account securely with Google.</p>
      <GoogleAuthFlow />
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? Google sign-in will take you back to it.</p>
    </AuthCard>
  </AuthPageLayout>
}
