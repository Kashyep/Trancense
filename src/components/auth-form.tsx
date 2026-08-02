'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

type Mode = 'sign-in' | 'sign-up' | 'forgot'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const copy = mode === 'sign-in' ? { title: 'Welcome back', subtitle: 'Continue your audit workspace.', button: 'Sign in' } : mode === 'sign-up' ? { title: 'Start your pilot', subtitle: 'Create a workspace for your first facility assessment.', button: 'Create account' } : { title: 'Reset your password', subtitle: 'We will send a recovery link if the account exists.', button: 'Send recovery link' }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('')
    const supabase = createSupabaseBrowserClient()
    if (!supabase) {
      setMessage('Supabase is not configured in this environment. Opening the clearly labelled local demo workspace.')
      window.setTimeout(() => router.push('/dashboard'), 600)
      return
    }
    const result = mode === 'sign-in' ? await supabase.auth.signInWithPassword({ email, password }) : mode === 'sign-up' ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }) : await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    if (result.error) setMessage(result.error.message)
    else if (mode === 'forgot') setMessage('Check your email for the recovery link.')
    else router.push('/dashboard')
    setBusy(false)
  }

  return <div className="auth-page"><div className="auth-card"><Link href="/" className="brand"><span className="brand-mark"/>Trancense</Link><div style={{ marginTop: 30 }}><p className="eyebrow">Audit Workspace</p><h1>{copy.title}</h1><p className="auth-subtitle">{copy.subtitle}</p></div>{message && <Notice>{message}</Notice>}<form className="form-stack" onSubmit={submit}>{mode === 'sign-up' && <div className="field"><label htmlFor="name">Full name</label><input id="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name"/></div>}<div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com"/></div>{mode !== 'forgot' && <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"/></div>}<button className="button button-primary" disabled={busy} type="submit">{busy ? 'Working…' : copy.button}</button></form>{mode === 'sign-in' && <div className="auth-foot"><Link href="/forgot-password">Forgot password?</Link></div>}{mode !== 'forgot' && <div className="auth-foot">{mode === 'sign-in' ? <>New to Trancense? <Link href="/sign-up">Create an account</Link></> : <>Already have an account? <Link href="/sign-in">Sign in</Link></>}</div>}{mode === 'forgot' && <div className="auth-foot"><Link href="/sign-in">Return to sign in</Link></div>}<div className="auth-foot" style={{ marginTop: 25 }}>Results require human review. Trancense is not a certified regulatory submission tool.</div></div></div>
}

function Notice({ children }: { children: React.ReactNode }) { return <div className="notice notice-warning" style={{ marginTop: 18 }}><div>!</div><div><strong>Configuration notice</strong><p>{children}</p></div></div> }
