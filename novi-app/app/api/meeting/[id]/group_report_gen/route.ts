import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

/**
 * GET /api/meeting/[id]/group_report_gen
 * Generates an Excel (.xlsx) file detailing student focus metrics for a specific group meeting.
 * Compiles the file dynamically in memory before uploading it straight to Supabase Storage 
 * and logging the metadata history to the `group_report` table.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Step 1: Database Extraction
    // Fetch all comprehensive group session overview summaries from this target meeting
    const { data: participants, error } = await supabase
      .from('group_session_overview')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      console.error('[Excel Gen] Error fetching group session data:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch data' }, { status: 500 });
    }

    // Do not generate or save empty reports if no users joined the room successfully
    if (!participants || participants.length === 0) {
      return NextResponse.json({ ok: false, message: 'No data found for this session' });
    }

    // Step 2: Define Columns
    const headers = [
      'Participant Name',
      'Focus Pct',
      'Distraction Pct',
      'Peak Distraction Pct',
      'Peak Distraction Time'
    ];

    // Step 3: Map and Calculate Rows
    // Iterate through database records and compute readable percentages and sanitized time strings
    const rows = participants.map((p) => {
      const total = p.total_checks || 0;
      const distracted = p.distracted_checks || 0;
      
      const distractionPct = total > 0 ? (distracted / total) * 100 : 0;
      const focusPct = total > 0 ? 100 - distractionPct : 100;
      
      // Format chronological timestamps accurately to simple local readable structures
      const peakTimeFormatted = p.peak_distraction_time 
        ? new Date(p.peak_distraction_time).toLocaleTimeString() 
        : 'N/A';

      return [
        p.participant_name || 'Unknown',
        Math.round(focusPct).toString() + '%',
        Math.round(distractionPct).toString() + '%',
        Math.round(p.peak_distraction_pct || 0).toString() + '%',
        peakTimeFormatted
      ];
    });

    // Step 4: Construct the Document using SheetJS (XLSX)
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Apply header style formatting (e.g., Bold definitions). 
    // Note: The community version of 'xlsx' strips style objects by default on write,
    // but building the style object anyway in case it's processed properly by certain readers.
    for (let c = 0; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: c });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true }
      };
    }
    
    // Auto-size vertical columns explicitly so names aren't chopped off natively in Excel
    ws['!cols'] = [
      { wch: 25 }, // Participant Name
      { wch: 15 }, // Focus Pct
      { wch: 20 }, // Distraction Pct
      { wch: 25 }, // Peak Distraction Pct
      { wch: 25 }, // Peak Distraction Time
    ];

    // Create a new Workbook container and link the fully mapped worksheet object to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate Raw File Binary stream targetting standard OpenXML format
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Establish a unique descriptive naming convention linking back to the DB session implicitly
    const fileName = `group_report-MeetingID-${sessionId}.xlsx`;

    // Step 5: Upload the physical document stream into Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated_reports') // Connect to designated teacher reports storage bucket
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true // Ensures redundant calls safely overwrite rather than crash
      });

    if (uploadError) {
      console.error('[Excel Gen] Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      );
    }

    console.log(`[Excel Gen] Successfully uploaded report to Supabase: ${fileName}`);

    // Step 6: Log Metadata history referencing the new file physically inside the `group_report` relational table.
    const now = new Date();
    
    // Extract YYYY-MM-DD explicitly scoped strictly to local timezone constraints (Asia/Colombo)
    const dateFormatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Colombo', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const generatedDate = dateFormatter.format(now);

    // Extract HH:MM:SS implicitly preserving the exact hour definition irrespective of server cloud locale biases
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    const generatedTime = timeFormatter.format(now);

    const { error: dbError } = await supabase
      .from('group_report')
      .insert({
        session_id: sessionId,
        file_name: fileName,
        generated_date: generatedDate,
        generated_time: generatedTime
      });

    if (dbError) {
      console.error('[Excel Gen] Error saving report metadata:', dbError);
      return NextResponse.json(
        { ok: false, error: `Metadata save failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Excel report generated and securely saved to Supabase',
      file: fileName
    });

  } catch (err: any) {
    console.error('[Excel Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}