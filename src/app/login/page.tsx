import LoginForm from "@/app/auth/components/LoginForm";
import { GuestGuard } from "@/context/AuthContext";

type LoginPageProps = {
  searchParams: Promise<{
    passwordReset?: string | string[];
    inviteToken?: string | string[];
    workspaceJoined?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const passwordReset =
    params.passwordReset === "success" ||
    (Array.isArray(params.passwordReset) &&
      params.passwordReset.includes("success"));
  const inviteToken = Array.isArray(params.inviteToken)
    ? params.inviteToken[0]
    : params.inviteToken;
  const workspaceJoined =
    params.workspaceJoined === "1" ||
    (Array.isArray(params.workspaceJoined) &&
      params.workspaceJoined.includes("1"));

  return (
    <GuestGuard>
      <LoginForm
        passwordReset={passwordReset}
        inviteToken={inviteToken}
        workspaceJoined={workspaceJoined}
      />
    </GuestGuard>
  );
}
