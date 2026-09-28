"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupWithEmail } from "@/lib/firebase/auth"
import AuthPageLayout, { AuthCard, AuthBrand } from "./AuthPageLayout"
import { AuthError, AuthField, AuthSubmit } from "./AuthFormParts"
import GoogleAuthFlow from "./GoogleAuthFlow"

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string()
    .min(9, "Use at least 9 characters.")
    .regex(/[A-Z]/, "Add at least one uppercase letter.")
    .regex(/[a-z]/, "Add at least one lowercase letter.")
    .regex(/[0-9]/, "Add at least one number.")
    .regex(/[^A-Za-z0-9]/, "Add at least one special character."),
  confirmPassword: z.string().min(1, "Confirm your password."),
}).refine((values) => values.password === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
type SignupValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })
  const mutation = useMutation({
    mutationFn: (values: SignupValues) => signupWithEmail(values.name, values.email, values.password),
    onSuccess: () => router.replace("/dashboard"),
  })

  return <AuthPageLayout mode="signup">
    <AuthCard>
      <AuthBrand />
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create your workspace</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Start organizing work with your team.</p>
      <GoogleAuthFlow />
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-4 space-y-4" noValidate>
        <AuthField label="Name" name="name" placeholder="Alex Morgan" form={form} />
        <AuthField label="Email" name="email" type="email" placeholder="you@company.com" form={form} />
        <AuthField label="Password" name="password" type="password" placeholder="At least 9 characters" form={form} />
        <AuthField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" form={form} />
        {mutation.error && <AuthError error={mutation.error} />}
        <AuthSubmit loading={mutation.isPending}>Create account</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-emerald-800">Sign in</Link></p>
    </AuthCard>
  </AuthPageLayout>
}
