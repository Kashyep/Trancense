import type { Metadata } from "next"; import { AuthForm } from "@/components/auth-form"; import { AuthLayout } from "@/components/auth-layout";
export const metadata: Metadata = { title: "Password recovery", robots: { index: false, follow: false } };
export default function Forgot(){return <AuthLayout eyebrow="Password recovery"><AuthForm mode="forgot"/></AuthLayout>}
