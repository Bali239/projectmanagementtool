import LoginForm from "@/app/auth/components/LoginForm"
import { GuestGuard } from "@/context/AuthContext"

export default function LoginPage() {
  return <GuestGuard><LoginForm /></GuestGuard>
}
