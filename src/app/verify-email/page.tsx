import VerifyEmailForm from "@/app/auth/components/VerifyEmailForm"

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams
  const token = Array.isArray(params.token) ? params.token[0] ?? "" : params.token ?? ""
  return <VerifyEmailForm token={token} />
}