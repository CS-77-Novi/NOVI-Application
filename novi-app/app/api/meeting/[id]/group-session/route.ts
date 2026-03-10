import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  const query = supabase.from("group_session").select("*");
  if (sessionId) query.eq("session_id", sessionId).single();

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Used to save the final group metrics once the session concludes
export async function POST(request: Request) {
  const body = await request.json();
  
  const { data, error } = await supabase
    .from("group_session")
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}