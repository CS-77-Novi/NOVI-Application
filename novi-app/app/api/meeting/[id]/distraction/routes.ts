// Import required Next.js server route handlers
import { NextRequest, NextResponse } from 'next/server'
// Import the shared Supabase client for database operations
import { supabase } from '@/lib/supabase'

// Define the time limit (10 seconds) after which a participant's data is considered disconnected/stale
const STALE_THRESHOLD_SECS = 10

/** 
 * GET /api/meeting/[id]/routes
 * Retrieves the current aggregate distraction status for all active participants in a meeting.
 */
export async function GET(
  _req: NextRequest, // The incoming Next.js request (unused in body but required by signature)
  { params }: { params: Promise<{ id: string }> } // The dynamic route parameters containing the meeting ID
) {
  // Await and extract the meeting ID from the URL parameters
  const { id } = await params

  // Calculate the timestamp threshold for stale data (current time minus 10 seconds)
  const staleTime = new Date(Date.now() - STALE_THRESHOLD_SECS * 1000).toISOString()

  // Query Supabase for all distraction records matching the meeting ID that were updated recently
  const { data, error } = await supabase
    .from('meeting_distraction')
    .select('*')
    .eq('meeting_id', id)
    // Only fetch records where 'last_seen' is newer than our stale threshold
    .gt('last_seen', staleTime)

  // Handle any database errors gracefully by returning a safe empty state
  if (error) {
    console.error('[distraction GET]', error)
    return NextResponse.json({ distractedCount: 0, totalCount: 0, participants: [] })
  }

  // Initialize accumulators for the overall meeting statistics
  let distractedCount = 0
  let totalCount = 0

  // Process and format the raw database rows into client-friendly participant objects
  const participants = (data ?? []).map((row) => {
    // Calculate the individual's overall distraction percentage to date
    const distractionPct =
      row.total_checks > 0
        ? Math.round((row.distracted_checks / row.total_checks) * 100)
        : 0

    // Only count participants towards the live totals if they have a valid tracking status
    if (row.status === 'FOCUSED' || row.status === 'DISTRACTED') {
      totalCount++ // Increment total active users tracked
      if (row.status === 'DISTRACTED') distractedCount++ // Increment count if actively distracted
    }

    // Return the formatted participant data structure
    return {
      participantId: row.participant_id, // Stream video participant ID
      name: row.name, // Display name
      totalChecks: row.total_checks, // Total lifetime frames analyzed
      distractedChecks: row.distracted_checks, // Total lifetime frames marked distracted
      distractionPct, // Computed percentage
      peakDistractionPct: row.peak_distraction_pct, // Highest single-session distraction spike
      peakDistractionTime: row.peak_distraction_time
        // Convert the peak time string back to a Javascript timestamp if it exists
        ? new Date(row.peak_distraction_time).getTime()
        : 0,
    }
  })

  // Return the processed aggregate metrics and participant list as JSON
  return NextResponse.json({ distractedCount, totalCount, participants })
}

/** 
 * POST /api/meeting/[id]/routes
 * Accepts an individual participant's local telemetry and upserts it into the database.
 */
export async function POST(
  req: NextRequest, // The incoming Next.js request containing the JSON payload
  { params }: { params: Promise<{ id: string }> } // The dynamic route parameters containing the meeting ID
) {
  // Await and extract the meeting ID
  const { id } = await params
  
  // Parse the incoming JSON body to extract the participant's distraction data
  const body = await req.json() as {
    participantId: string
    name: string
    status: string
    totalChecks: number
    distractedChecks: number
    peakDistractionPct: number
    peakDistractionTime: number
  }

  // Attempt to insert or update (upsert) the database record for this participant
  const { error } = await supabase
    .from('meeting_distraction')
    .upsert({
      meeting_id: id,
      participant_id: body.participantId,
      name: body.name,
      status: body.status,
      total_checks: body.totalChecks ?? 0,
      distracted_checks: body.distractedChecks ?? 0,
      peak_distraction_pct: body.peakDistractionPct ?? 0,
       // Convert incoming Javascript timestamp to an ISO string for Postgres, or pass null
      peak_distraction_time: body.peakDistractionTime
        ? new Date(body.peakDistractionTime).toISOString()
        : null,
      // Always update the 'last_seen' heartbeat to the current server time
      last_seen: new Date().toISOString(),
    }, 
    // Define the unique constraint columns to trigger an update instead of a blind insert
    { onConflict: 'meeting_id,participant_id' })

  // Log any database insertion errors but still return success to the client to prevent blocking
  if (error) console.error('[distraction POST]', error)
  return NextResponse.json({ ok: true })
}

/** 
 * DELETE /api/meeting/[id]/routes
 * Removes a participant's distraction record when they explicitly leave the meeting.
 */
export async function DELETE(
  req: NextRequest, // The incoming Next.js request containing query parameters
  { params }: { params: Promise<{ id: string }> } // The dynamic route parameters containing the meeting ID
) {
  // Await and extract the meeting ID
  const { id } = await params
  
  // Extract the specific participant ID to remove from the URL query string
  const participantId = req.nextUrl.searchParams.get('participantId')

  // Only proceed with deletion if a target participant was specified
  if (participantId) {
    // Delete the specific participant's row for this meeting
    const { error } = await supabase
      .from('meeting_distraction')
      .delete()
      .eq('meeting_id', id)
      .eq('participant_id', participantId)

    // Log any deletion errors
    if (error) console.error('[distraction DELETE]', error)
  }

  // Acknowledge the deletion request
  return NextResponse.json({ ok: true })
}