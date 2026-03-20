import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const file_name = req.nextUrl.searchParams.get('file_name');

    if (!file_name) {
      return NextResponse.json({ ok: false, error: 'Missing file_name parameter' }, { status: 400 });
    }

    // Generate a signed URL valid for 60 seconds
    const { data, error } = await supabase
      .storage
      .from('generated_reports')
      .createSignedUrl(file_name, 60);

    if (error || !data?.signedUrl) {
      console.error('[Download File API] Error creating signed URL:', error);
      return NextResponse.json({ ok: false, error: error?.message || 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: data.signedUrl });

  } catch (err: any) {
    console.error('[Download File API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
