import LoginForm from "@/app/auth/components/LoginForm"
import { GuestGuard } from "@/context/AuthContext"

type LoginPageProps = {
  searchParams: Promise<{ passwordReset?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const passwordReset = params.passwordReset === "success" || (Array.isArray(params.passwordReset) && params.passwordReset.includes("success"))
  return <GuestGuard><LoginForm passwordReset={passwordReset} /></GuestGuard>
}
