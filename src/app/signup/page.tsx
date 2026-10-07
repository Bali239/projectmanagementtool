import SignupForm from "@/app/auth/components/SignupForm";
import { GuestGuard } from "@/context/AuthContext";

type SignupPageProps = {
  searchParams: Promise<{ inviteToken?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const inviteToken = Array.isArray(params.inviteToken)
    ? params.inviteToken[0]
    : params.inviteToken;

  return (
    <GuestGuard>
      <SignupForm inviteToken={inviteToken} />
    </GuestGuard>
  );
}
