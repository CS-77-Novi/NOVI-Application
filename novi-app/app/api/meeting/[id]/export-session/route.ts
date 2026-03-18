import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();

    // Only allow this 'Overall' logic for teachers
    if (type !== 'teacher') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // 1. Fetch EVERY student record currently in the group table
    const { data: allStudents, error: fetchError } = await supabase
      .from('group_session')
      .select('*');

    if (fetchError || !allStudents || allStudents.length === 0) {
      return NextResponse.json({ success: false, error: "No active student data found" });
    }

    // 2. WIPE the tables so they are empty for the next class/session
    // We clear the whole table because the teacher is finished with this group
    await supabase.from('group_session').delete().neq('session_id', 0); // Deletes everything
    await supabase.from('report').delete().neq('report_id', 0);

    return NextResponse.json({ 
      success: true, 
      payload: allStudents // Returns the array of all students
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}