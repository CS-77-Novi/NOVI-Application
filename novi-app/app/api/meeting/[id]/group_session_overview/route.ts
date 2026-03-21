import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/** 
 * GET /api/meeting/[id]/group-session
 * Retrieves the core aggregated metrics mapping (distracted vs engaged counts) alongside
 * the comprehensive list of tracking analytics per participant for the identified session.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Note: No stale time filter is used here as there is no last_seen / created_at column natively driving this.
  const { data, error } = await supabase
    .from('group_session_overview')
    .select('*')
    .eq('session_id', id)

  if (error) {
    console.error('[group_session_overview GET]', error)
    return NextResponse.json({ distractedCount: 0, totalCount: 0, participants: [] })
  }

  // Pre-calculate aggregate state totals mapping to be consumed by real-time teacher UI
  let distractedCount = 0
  let totalCount = 0
  
  // Transform and calculate distraction ratios on-the-fly referencing row attributes
  const participants = (data ?? []).map((row) => {
    const distractionPct =
      row.total_checks > 0
        ? Math.round((row.distracted_checks / row.total_checks) * 100)
        : 0

    // Count strictly active status markers to bypass disconnected/waiting states from skewing charts
    if (row.status === 'FOCUSED' || row.status === 'DISTRACTED') {
      totalCount++
      if (row.status === 'DISTRACTED') distractedCount++
    }

    return {
      participantId: row.participant_id,
      name: row.participant_name,
      status: row.status,
      totalChecks: row.total_checks,
      distractedChecks: row.distracted_checks,
      distractionPct,
      peakDistractionPct: row.peak_distraction_pct,
      peakDistractionTime: row.peak_distraction_time
        ? new Date(row.peak_distraction_time).getTime()
        : 0,
    }
  })

  return NextResponse.json({ distractedCount, totalCount, participants })
}

/** 
 * POST /api/meeting/[id]/group-session
 * A highly frequent update mechanism designed to handle the client sending a full snapshot array
 * of a participant's active metadata state. Acts iteratively as a programmatic Upsert resolving ties.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Extract tracking metric block parsed accurately from JSON webhook
  const body = await req.json() as {
    participantId: string
    name: string
    status?: string
    totalChecks: number
    distractedChecks: number
    peakDistractionPct: number
    peakDistractionTime: number
  }

  // Check if participant already exists manually without relying strictly on composite primary keys for Upsert operations
  const { data: existing, error: selectError } = await supabase
    .from('group_session_overview')
    .select('session_id')
    .eq('session_id', id)
    .eq('participant_id', body.participantId)
    .maybeSingle()

  if (selectError) {
    console.error('[group_session_overview POST select error]', selectError)
    return NextResponse.json({ ok: false, error: selectError.message }, { status: 500 })
  }

  // Format mapping block matching Supabase constraints and schema expectations
  const payload = {
    session_id: id,
    participant_id: body.participantId,
    participant_name: body.name,
    status: body.status,
    total_checks: body.totalChecks ?? 0,
    distracted_checks: body.distractedChecks ?? 0,
    peak_distraction_pct: body.peakDistractionPct ?? 0,
    peak_distraction_time: body.peakDistractionTime
      ? new Date(body.peakDistractionTime).toISOString()
      : null,
  }

  let dbError;

  // Split logic: Safely perform either an update overwrite or a brand new insert payload setup
  if (existing) {
    const { error } = await supabase
      .from('group_session_overview')
      .update(payload)
      .eq('session_id', id)
      .eq('participant_id', body.participantId)
    dbError = error
  } else {
    const { error } = await supabase
      .from('group_session_overview')
      .insert(payload)
    dbError = error
  }

  if (dbError) {
    console.error('[group_session_overview POST update/insert error]', dbError)
    return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 })
  }
  
  return NextResponse.json({ ok: true })
}

/** 
 * DELETE /api/meeting/[id]/group-session?participantId=xxx 
 * Purges an individual participant row gracefully bridging disconnects and clean removals.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const participantId = req.nextUrl.searchParams.get('participantId')

  if (participantId) {
    const { error } = await supabase
      .from('group_session_overview')
      .delete()
      .eq('session_id', id)
      .eq('participant_id', participantId)

    if (error) console.error('[group_session_overview DELETE]', error)
  }

  return NextResponse.json({ ok: true })
}