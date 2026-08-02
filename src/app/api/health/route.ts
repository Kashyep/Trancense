import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = isSupabaseConfigured()
  return NextResponse.json({
    status: 'ok',
    version: '0.1.0',
    application: 'ok',
    database: configured ? 'configured' : 'not-configured',
    storage: configured ? 'configured' : 'not-configured',
    ai: process.env.AI_API_KEY ? 'configured' : 'not-configured',
    note: configured ? 'Supabase configuration detected; verify migrations and policies.' : 'Core demo mode is available. Configure Supabase for real authentication and persistence.',
  })
}
