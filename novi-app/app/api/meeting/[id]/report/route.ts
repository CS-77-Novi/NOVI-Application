import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  let query = supabase.from("report").select("*");
  if (sessionId) query = query.eq("session_id", sessionId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Saves the file path info after the CSV is uploaded to Storage
export async function POST(request: Request) {
  try {
    const body = await request.json(); // { session_id, file_name, file_path, generated_time }
    
    const { data, error } = await supabase
      .from("report")
      .insert([{
        session_id: body.session_id,
        file_name: body.file_name,
        file_path: body.file_path,
        generated_time: body.generated_time || new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}