import SignupForm from "@/app/auth/components/SignupForm"
import { GuestGuard } from "@/context/AuthContext"

export default function SignupPage() {
  return <GuestGuard><SignupForm /></GuestGuard>
}
