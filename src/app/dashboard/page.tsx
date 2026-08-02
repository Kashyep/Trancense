import { redirect } from 'next/navigation'
import { PilotWorkspace } from '@/components/pilot-workspace'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/sign-in')
    const { data: membership, error } = await supabase.from('workspace_memberships').select('workspace_id').eq('user_id', user.id).limit(1).maybeSingle()
    if (!error && !membership) redirect('/onboarding')
  }
  return <PilotWorkspace/>
}
