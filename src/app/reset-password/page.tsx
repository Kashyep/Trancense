import type { Metadata } from "next"; import { AuthForm } from "@/components/auth-form"; import { AuthLayout } from "@/components/auth-layout";
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export default function Reset(){return <AuthLayout eyebrow="Password recovery"><AuthForm mode="reset"/></AuthLayout>}
