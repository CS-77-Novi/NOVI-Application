import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET endpoint designed to securely delegate the payload delivery of the report.
 * It does not stream the file itself but rather negotiates with Supabase
 * to create a temporary signed download URL for direct access to the bucket.
 */
export async function GET(req: NextRequest) {
  try {
    // The explicit target filename requested for download
    const file_name = req.nextUrl.searchParams.get('file_name');

    if (!file_name) {
      return NextResponse.json({ ok: false, error: 'Missing file_name parameter' }, { status: 400 });
    }

    // API Call to Supabase Storage passing the name of the file requested
    // Configured to generate a signed URL valid for just 60 seconds protecting against hyperlink leakage
    const { data, error } = await supabase
      .storage
      .from('individual_reports') // Connect to individual's isolated environment bucket
      .createSignedUrl(file_name, 60);

    // Fail quickly if signing is rejected (e.g., file not found or internal rule blocker)
    if (error || !data?.signedUrl) {
      console.error('[Ind Download File API] Error creating signed URL:', error);
      return NextResponse.json({ ok: false, error: error?.message || 'Failed to generate download URL' }, { status: 500 });
    }

    // Return the time-bound secure URL for frontend usage
    return NextResponse.json({ ok: true, url: data.signedUrl });

  } catch (err: any) {
    // Top-level crash safety net
    console.error('[Ind Download File API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
