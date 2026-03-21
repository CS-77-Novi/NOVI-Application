import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE handler for permanently removing a teacher report and all associated session metadata entirely.
 * It sweeps cascading deletions across the Storage Bucket, group_report, and host_meetings tables.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Parse the JSON request body
    const body = await req.json();
    const { file_name, session_id } = body;

    // Validate that both required identifiers were correctly handed off in the payload
    if (!file_name || !session_id) {
      return NextResponse.json({ ok: false, error: 'Missing file_name or session_id' }, { status: 400 });
    }

    // Step 1: Storage Layer Deletion 
    // Delete the generated `.xlsx` report file natively originating from the 'generated_reports' storage bucket
    const { error: storageError } = await supabase
      .storage
      .from('generated_reports')
      .remove([file_name]);

    if (storageError) {
      console.error('[Delete Report API] Error deleting file from storage:', storageError);
      return NextResponse.json({ ok: false, error: storageError.message }, { status: 500 });
    }

    // Step 2: Intermediate Summary Table Deletion 
    // Delete the tracking metadata row from the 'group_report' table matching exactly the target filename
    const { error: reportError } = await supabase
      .from('group_report')
      .delete()
      .eq('file_name', file_name);

    if (reportError) {
      console.error('[Delete Report API] Error deleting from group_report:', reportError);
      return NextResponse.json({ ok: false, error: reportError.message }, { status: 500 });
    }

    // Step 3: Base Session Deletion 
    // Delete the root master node of the session tracking from the 'host_meetings' table
    const { error: hostError } = await supabase
      .from('host_meetings')
      .delete()
      .eq('meeting_id', session_id);

    if (hostError) {
      // In a robust implementation, a rollback or dead-letter queue might be employed here
      // if steps 1 and 2 succeed but step 3 fails asynchronously.
      console.error('[Delete Report API] Error deleting from host_meetings:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // Provide confirmation back to the orchestrating client UI
    return NextResponse.json({ ok: true, message: 'Report deleted successfully' });

  } catch (err: any) {
    // Top-level network or parsing error boundary
    console.error('[Delete Report API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
