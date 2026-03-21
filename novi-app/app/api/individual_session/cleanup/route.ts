import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE - Blanket cleanup functionality for a specific individual host.
 * This endpoint forcefully clears all records associated with a specific host_id across three tables:
 * `ind_session`, `ind_attention_analysis`, and `ind_session_overview`.
 * Useful for purging testing data or a full user state reset.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Extract the host_id identifier
    const host_id = req.nextUrl.searchParams.get('host_id');

    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Missing host_id parameter' }, { status: 400 });
    }

    // Step 1: Delete all granular session tracking rows from ind_session
    const { error: sessError } = await supabase
      .from('ind_session')
      .delete()
      .eq('host_id', host_id);

    if (sessError) {
      console.error('[Ind Cleanup] Error deleting session rows:', sessError);
      // Proceeding rather than throwing to ensure a best-effort cleanup across all tables
    }

    // Step 2: Delete all attention analysis timeline rows from ind_attention_analysis
    const { error: attError } = await supabase
      .from('ind_attention_analysis')
      .delete()
      .eq('host_id', host_id);

    if (attError) {
      console.error('[Ind Cleanup] Error deleting attention analysis rows:', attError);
    }

    // Step 3: Delete the high-level session overview summaries from ind_session_overview
    const { error } = await supabase
      .from('ind_session_overview')
      .delete()
      .eq('host_id', host_id);

    if (error) {
      console.error('[Ind Cleanup] Error deleting session overview rows:', error);
      // The final step returns an error response if it fails
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Only returns fully true once the final table deletion passes (and earlier ones were at least attempted)
    return NextResponse.json({ ok: true, message: 'Cleanup completed successfully' });

  } catch (err: any) {
    // Top-level network or execution catch block
    console.error('[Ind Cleanup] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
