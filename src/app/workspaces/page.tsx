import { AuthGuard } from "@/context/AuthContext";
import WorkspacePicker from "./WorkspacePicker";

type WorkspacesPageProps = {
  searchParams: Promise<{ inviteError?: string | string[] }>;
};

export default async function WorkspacesPage({
  searchParams,
}: WorkspacesPageProps) {
  const params = await searchParams;
  const inviteError = Array.isArray(params.inviteError)
    ? params.inviteError[0]
    : params.inviteError;

  return (
    <AuthGuard>
      <WorkspacePicker inviteError={inviteError} />
    </AuthGuard>
  );
}