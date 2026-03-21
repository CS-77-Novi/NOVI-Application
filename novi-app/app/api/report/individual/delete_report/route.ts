import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE handler for permanently removing an individual report.
 * It deletes the the actual physical .xlsx file from the Supabase bucket
 * and then deletes the metadata row tracking it in the SQL table.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Parse the JSON request body
    const body = await req.json();
    const { file_name, session_id } = body;

    // Validate that both required identifiers were passed in the payload
    if (!file_name || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing file_name or session_id' }, { status: 400 });
    }

    // Step 1: Storage Layer Deletion 
    // Attempt to permanently delete the target `.xlsx` file from the dedicated individual_reports bucket
    const { error: storageError } = await supabase
      .storage
      .from('individual_reports')
      .remove([file_name]);

    if (storageError) {
      // If bucket deletion fails, log and abort without affecting DB state
      console.error('[Ind Delete Report API] Error deleting file from storage:', storageError);
      return NextResponse.json({ ok: false, error: storageError.message }, { status: 500 });
    }

    // Step 2: Database Layer Deletion 
    // Using file_name as the matching key to delete the historical record in the table
    const { error: reportError } = await supabase
      .from('ind_report')
      .delete()
      .eq('file_name', file_name);

    if (reportError) {
      // Edge case: File deleted from storage but DB row was left stranded, log it.
      console.error('[Ind Delete Report API] Error deleting from ind_report:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    // Returns a simple boolean assertion message verifying successful teardown of the resource
    return NextResponse.json({ ok: true, message: 'Report deleted successfully' });

  } catch (err: any) {
    // Top-level error boundary to catch parse errors or disconnected clients
    console.error('[Ind Delete Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
