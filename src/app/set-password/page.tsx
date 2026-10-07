import ResetPasswordForm from "@/app/auth/components/ResetPasswordForm";
import { GuestGuard } from "@/context/AuthContext";

type SetPasswordPageProps = {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SetPasswordPage({
  searchParams,
}: SetPasswordPageProps) {
  const params = await searchParams;

  return (
    <GuestGuard>
      <ResetPasswordForm
        email={firstValue(params.email)}
        token={firstValue(params.token)}
      />
    </GuestGuard>
  );
}