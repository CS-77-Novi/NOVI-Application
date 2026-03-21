import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { auth } from '@clerk/nextjs/server';

/**
 * GET - Generate Individual Report Excel File.
 * This endpoint constructs an `.xlsx` file detailing the specific tracking timeline 
 * of a session. Once built in memory, it uploads the file to the 'individual_reports' 
 * Supabase storage bucket and inserts mapping metadata into the 'ind_report' table.
 */
export async function GET(req: NextRequest) {
  try {
    // Requires a session target representing the span of data to compile
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'Missing session_id parameter' }, { status: 400 });
    }

    // Security Check: Attempt to use the query parameter for host_id, 
    // and fallback seamlessly to Clerk's authenticated context if absent.
    let hostId = req.nextUrl.searchParams.get('host_id');
    
    if (!hostId) {
      const { userId } = await auth();
      hostId = userId;
    }

    if (!hostId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id found' }, { status: 401 });
    }

    // Step 1: Database Extraction
    // Fetch all chronological granular metrics recorded during the target session
    const { data: sessionRows, error } = await supabase
      .from('ind_session')
      .select('*') // get all columns
      .eq('session_id', sessionId)
      .eq('host_id', hostId)
      .order('time', { ascending: true }); // sort strictly chronologically for report readability

    if (error) {
      console.error('[Ind Excel Gen] Error fetching session data:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch tracking data' }, { status: 500 });
    }

    // Empty state boundary: Do not generate empty files
    if (!sessionRows || sessionRows.length === 0) {
      return NextResponse.json({ ok: false, message: 'No tracking data found for this session belonging to the current user' });
    }

    // Step 2: Excel Formatting
    // Defining explicit column headers, intentionally omitting verbose metadata like `host_id`
    const headers = [
      'session_id',
      'gaze_direction',
      'head_direction',
      'distraction_pct',
      'time'
    ];

    // Data Mapping: Map out exactly to the structure corresponding horizontally to the headers 
    const rows = sessionRows.map((row) => {
      return [
        row.session_id,
        row.gaze_direction,
        row.head_direction,
        row.distraction_pct,
        row.time
      ];
    });

    // Translate the two-dimensional array into an active Excel Worksheet memory object
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Iterate through the top row to apply bold styling styling configuration
    for (let c = 0; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: c });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true }
      };
    }
    
    // Define exact column widths using character count spacing for formatting neatness
    ws['!cols'] = [
      { wch: 40 }, // session_id (Long UUID width equivalent)
      { wch: 18 }, // gaze_direction
      { wch: 18 }, // head_direction
      { wch: 18 }, // distraction_pct
      { wch: 18 }, // time
    ];

    // Instantiate a Workbook and link the generated sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Build the final binary file stream buffer ready for upload
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Ensure the filename is uniquely identifiable by the linking session ID
    const fileName = `ind_report-SessionID-${sessionId}.xlsx`;

    // Step 3: Supabase Storage Upload
    // Stream the binary buffer into the individual_reports bucket, defining proper Mime Type
    const { error: uploadError } = await supabase.storage
      .from('individual_reports')
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true // Allows safely wiping out an old matching file during a retry payload
      });

    if (uploadError) {
      console.error('[Ind Excel Gen] Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      );
    }

    console.log(`[Ind Excel Gen] Successfully uploaded report to Supabase: ${fileName}`);

    // Step 4: Metadata Registration
    // Generate isolated timestamps safely localized to the desired Colombo timezone
    const now = new Date();
    
    // Formatter mapping: Year-Month-Day
    const dateFormatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Colombo', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const generatedDate = dateFormatter.format(now);

    // Formatter mapping: 24-hr layout Hour:Minute:Second
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    const generatedTime = timeFormatter.format(now);

    // Commit the history item to the `ind_report` table to drive the dashboard download panel
    const { error: dbError } = await supabase
      .from('ind_report')
      .insert({
        session_id: sessionId,
        host_id: hostId,
        file_name: fileName,
        generated_date: generatedDate,
        generated_time: generatedTime
      });

    // Provide logging in case the file exists but the table reference died natively.
    if (dbError) {
      console.error('[Ind Excel Gen] Error saving report metadata:', dbError);
      return NextResponse.json(
        { ok: false, error: `Metadata save failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Complete success boundary
    return NextResponse.json({ 
      ok: true, 
      message: 'Individual Excel report generated and safely saved to Supabase',
      file: fileName
    });

  } catch (err: any) {
    // Uncaught structural boundaries
    console.error('[Ind Excel Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
