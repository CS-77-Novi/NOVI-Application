import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET endpoint to securely create a temporary signed download URL for the teacher's report.
 * Provides ephemeral authorization for downloading private session reporting data.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract the explicit target filename from request parameters
    const file_name = req.nextUrl.searchParams.get('file_name');

    if (!file_name) {
      return NextResponse.json({ ok: false, error: 'Missing file_name parameter' }, { status: 400 });
    }

    // Call Supabase Storage asking specifically for the 'generated_reports' bucket
    // Generate a cryptographically signed URL valid for just 60 seconds protecting against hyperlink leakage
    const { data, error } = await supabase
      .storage
      .from('generated_reports')
      .createSignedUrl(file_name, 60);

    // Detect errors from the Supabase client such as file not found or internal rule blocker
    if (error || !data?.signedUrl) {
      console.error('[Download File API] Error creating signed URL:', error);
      return NextResponse.json({ ok: false, error: error?.message || 'Failed to generate download URL' }, { status: 500 });
    }

    // Provide the time-bound secure URL for frontend navigation anchoring to force download prompt
    return NextResponse.json({ ok: true, url: data.signedUrl });

  } catch (err: any) {
    // Global fallback error scoping block
    console.error('[Download File API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
