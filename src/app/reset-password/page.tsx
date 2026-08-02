'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(''); const [message, setMessage] = useState('')
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const supabase = createSupabaseBrowserClient(); if (!supabase) { setMessage('Supabase is not configured.'); return }; const { error } = await supabase.auth.updateUser({ password }); if (error) setMessage(error.message); else { setMessage('Password updated.'); window.setTimeout(() => router.push('/dashboard'), 700) } }
  return <div className="auth-page"><div className="auth-card"><Link href="/" className="brand"><span className="brand-mark"/>Trancense</Link><div style={{ marginTop: 30 }}><p className="eyebrow">Account recovery</p><h1>Choose a new password.</h1><p className="auth-subtitle">Use a password with at least eight characters.</p></div>{message && <div className="notice notice-warning"><div>!</div><div><strong>Account update</strong><p>{message}</p></div></div>}<form className="form-stack" onSubmit={submit}><div className="field"><label htmlFor="password">New password</label><input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)}/></div><button className="button button-primary" type="submit">Update password</button></form></div></div>
}
