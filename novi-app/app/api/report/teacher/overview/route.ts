import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET route querying the group_session_overview table for the Teacher's Dashboard.
 * Incorporates specific business logic for calculating peak distraction ratios,
 * and filtering/sorting those ratios based on adjustable thresholds set dynamically from the UI.
 */
export async function GET(req: NextRequest) {
  try {
    // Parse the threshold multiplier filter from query params.
    // Represents the minimum percentage limit filter for displaying distracted users.
    const thresholdParam = req.nextUrl.searchParams.get('threshold');
    const threshold = thresholdParam ? parseInt(thresholdParam, 10) : 75; // Defaults to identifying high distractions over 75%

    // Parse descending / ascending sort tracking state mapping boolean values
    const sortOrderParam = req.nextUrl.searchParams.get('sort');
    const isAscending = sortOrderParam === 'asc';

    // Parse the host_id identity check from query params
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Strict validation requirement verification check
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Step 1: Discover the Latest Meeting
    // Query host_meetings to lock onto the most recently created meeting node for this particular host_id
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id, date_time')
      .eq('host_id', host_id)
      .order('date_time', { ascending: false })
      .limit(1);

    if (hostError) {
      console.error('[Overview API] Error querying host_meetings for latest session:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // Terminate cleanly if no target history maps effectively
    if (!hostMatches || hostMatches.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: [],
            sessionDate: null
        } 
      });
    }

    const latestMeetingId = hostMatches[0].meeting_id;
    const meetingDateTime = hostMatches[0].date_time;

    if (!latestMeetingId) {
      return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: [],
            sessionDate: null
        } 
      });
    }

    // Step 2: Extract Relevant Raw Participant Information Data Structures
    // Specifically looking for the name strings & check counts stored locally to construct percentages
    const { data: rawData, error: distError } = await supabase
      .from('group_session_overview')
      .select('participant_name, total_checks, distracted_checks')
      .eq('session_id', latestMeetingId)
      .order('peak_distraction_time', { ascending: false });

    if (distError) {
      console.error('[Overview API] Error fetching distractions:', distError);
      return NextResponse.json({ ok: false, error: distError.message }, { status: 500 });
    }

    // Step 3: Mapping, Logic Calculation, and Threshold Filtering
    const distractionsData = (rawData || [])
      .map(row => {
        let pct = 0;
        // Protection division structure logic avoiding zero or undefined total checks calculation NaN outcomes
        if (row.total_checks && row.total_checks > 0) {
          pct = (row.distracted_checks / row.total_checks) * 100;
        }
        return {
          participant_name: row.participant_name,
          distraction_percentage: pct
        };
      })
      // Discarding users falling under the acceptable attention limit set externally
      .filter(row => row.distraction_percentage > threshold);

    // Step 4: Sorting final mapped array dataset
    distractionsData.sort((a, b) => {
        if (isAscending) {
            return a.distraction_percentage - b.distraction_percentage;
        } else {
            return b.distraction_percentage - a.distraction_percentage;
        }
    });

    // Step 5: Isolated session parameter querying strictly to populate dashboard headers uniformly
    const { data: sessionData, error: sessionError } = await supabase
        .from('group_session_overview')
        .select('peak_distraction_time')
        .eq('session_id', latestMeetingId)
        .order('peak_distraction_time', { ascending: false })
        .limit(1);

    if (sessionError) {
        // Continue even if session date parsing fails, UI resolves fallback states natively
        console.error('[Overview API] Error fetching session date:', sessionError);
    }

    // Complete object format wrapping for direct front end destructured parsing mapping
    return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: distractionsData || [],
            sessionDate: sessionData && sessionData.length > 0 ? sessionData[0].peak_distraction_time : null,
            meetingId: latestMeetingId,
            meetingDateTime: meetingDateTime
        } 
    });

  } catch (err: any) {
    // Unified network failout encapsulation logic
    console.error('[Overview API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}