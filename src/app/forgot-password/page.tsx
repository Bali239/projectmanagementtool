import ForgotPasswordForm from "@/app/auth/components/ForgotPasswordForm"
import { GuestGuard } from "@/context/AuthContext"

export default function ForgotPasswordPage() {
  return <GuestGuard><ForgotPasswordForm /></GuestGuard>
}
