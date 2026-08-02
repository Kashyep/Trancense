'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const workspaceSchema = z.object({
  workspaceName: z.string().trim().min(2).max(80),
  siteName: z.string().trim().min(2).max(80),
  facilityName: z.string().trim().min(2).max(80),
})

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function createPilotWorkspace(formData: FormData) {
  const parsed = workspaceSchema.safeParse({
    workspaceName: formData.get('workspaceName'),
    siteName: formData.get('siteName'),
    facilityName: formData.get('facilityName'),
  })
  if (!parsed.success) throw new Error('Enter a workspace, site, and facility name.')

  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect('/dashboard')
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: workspace, error: workspaceError } = await supabase!.from('workspaces').insert({ name: parsed.data.workspaceName, slug: `${slugify(parsed.data.workspaceName)}-${crypto.randomUUID().slice(0, 8)}`, created_by: user.id }).select('id').single()
  if (workspaceError || !workspace) throw new Error(workspaceError?.message ?? 'Workspace could not be created.')

  const { data: site, error: siteError } = await supabase!.from('sites').insert({ workspace_id: workspace.id, name: parsed.data.siteName, country: 'India', created_by: user.id }).select('id').single()
  if (siteError || !site) throw new Error(siteError?.message ?? 'Site could not be created.')
  const { data: facility, error: facilityError } = await supabase!.from('facilities').insert({ workspace_id: workspace.id, site_id: site.id, name: parsed.data.facilityName, floor_area_unit: 'm2', created_by: user.id }).select('id').single()
  if (facilityError || !facility) throw new Error(facilityError?.message ?? 'Facility could not be created.')
  const { data: audit, error: auditError } = await supabase!.from('audits').insert({ workspace_id: workspace.id, site_id: site.id, facility_id: facility.id, name: 'Initial facility assessment', objective: 'Establish a traceable energy baseline and prioritize practical efficiency actions.', status: 'active', created_by: user.id }).select('id').single()
  if (auditError || !audit) throw new Error(auditError?.message ?? 'Audit could not be created.')
  const { error: boundaryError } = await supabase!.from('reporting_boundaries').insert({ workspace_id: workspace.id, audit_id: audit.id, name: 'Initial facility boundary', description: 'Define the meters, energy sources, period, and operating scope for the first assessment.', created_by: user.id })
  if (boundaryError) throw new Error(boundaryError.message)
  redirect('/dashboard')
}
