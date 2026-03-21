import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'Missing session_id parameter' }, { status: 400 });
    }

    // Use query param for host_id if provided, otherwise fallback to clerk auth
    let hostId = req.nextUrl.searchParams.get('host_id');
    
    if (!hostId) {
      const { userId } = await auth();
      hostId = userId;
    }

    if (!hostId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id found' }, { status: 401 });
    }

    // Fetch all individual session tracking data for this meeting matching the host_id
    const { data: sessionRows, error } = await supabase
      .from('ind_session')
      .select('*') // get all columns
      .eq('session_id', sessionId)
      .eq('host_id', hostId)
      .order('time', { ascending: true }); // sort by time

    if (error) {
      console.error('[Ind Excel Gen] Error fetching session data:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch tracking data' }, { status: 500 });
    }

    if (!sessionRows || sessionRows.length === 0) {
      return NextResponse.json({ ok: false, message: 'No tracking data found for this session belonging to the current user' });
    }

    // We want all columns EXCEPT host_id
    const headers = [
      'session_id',
      'gaze_direction',
      'head_direction',
      'distraction_pct',
      'time'
    ];

    // Format Data Rows matching the header order 
    const rows = sessionRows.map((row) => {
      return [
        row.session_id,
        row.gaze_direction,
        row.head_direction,
        row.distraction_pct,
        row.time
      ];
    });

    // Create Worksheet from Array of Arrays
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Attempt to make headers bold
    for (let c = 0; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: c });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true }
      };
    }
    
    // Auto-size columns slightly for better readability
    ws['!cols'] = [
      { wch: 40 }, // session_id
      { wch: 18 }, // gaze_direction
      { wch: 18 }, // head_direction
      { wch: 18 }, // distraction_pct
      { wch: 18 }, // time
    ];

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate Excel File Buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Define File Name
    const fileName = `ind_report-SessionID-${sessionId}.xlsx`;

    // Upload to Supabase Storage Bucket named "individual_reports"
    const { error: uploadError } = await supabase.storage
      .from('individual_reports')
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    if (uploadError) {
      console.error('[Ind Excel Gen] Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      );
    }

    console.log(`[Ind Excel Gen] Successfully uploaded report to Supabase: ${fileName}`);

    // Insert metadata into the 'ind_report' table matching the format
    const now = new Date();
    
    const dateFormatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Colombo', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const generatedDate = dateFormatter.format(now);

    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    const generatedTime = timeFormatter.format(now);

    const { error: dbError } = await supabase
      .from('ind_report')
      .insert({
        session_id: sessionId,
        host_id: hostId,
        file_name: fileName,
        generated_date: generatedDate,
        generated_time: generatedTime
      });

    if (dbError) {
      console.error('[Ind Excel Gen] Error saving report metadata:', dbError);
      return NextResponse.json(
        { ok: false, error: `Metadata save failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Individual Excel report generated and safely saved to Supabase',
      file: fileName
    });

  } catch (err: any) {
    console.error('[Ind Excel Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
