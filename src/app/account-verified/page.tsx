import Link from "next/link";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth-layout";
import { ActionLink } from "@/components/ui";

export const metadata: Metadata = { title: "Account verified", robots: { index: false, follow: false } };

export default function AccountVerified() { return <AuthLayout eyebrow="Email confirmation"><section className="auth-card"><p className="kicker">Account verified</p><h1 className="mt-3">Your email is confirmed.</h1><p className="mt-4">Sign in to continue your Trancense setup. If the link was already used or is no longer valid, request a fresh confirmation from the sign-up flow.</p><ActionLink href="/sign-in" className="mt-7 w-full">Continue to sign in</ActionLink><p className="auth-links"><Link href="/">Return to Trancense</Link></p></section></AuthLayout>; }
