import { AuthForm } from "@/components/auth-form";

type SignInProps = {
  searchParams: Promise<{ verified?: string; error?: string }>;
};

export default async function SignIn({ searchParams }: SignInProps) {
  const params = await searchParams;
  const notice = params.verified === "1"
    ? "Email verified. Sign in to continue."
    : params.error === "callback"
      ? "We could not complete email verification. Request a new verification email and try again."
      : undefined;

  return <main className="flex min-h-screen items-center justify-center bg-[#efefef] p-5"><AuthForm mode="sign-in" notice={notice} /></main>;
}
