import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  const query = supabase.from("study_session").select("*");
  if (sessionId) query.eq("session_id", sessionId).single();

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// UPDATE: Used to save final ML calculations (Avg Score, Durations)
export async function PATCH(request: Request) {
  const body = await request.json();
  const { session_id, ...updates } = body;

  const { data, error } = await supabase
    .from("study_session")
    .update(updates)
    .eq("session_id", session_id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}