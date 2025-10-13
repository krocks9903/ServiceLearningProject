// src/services/db/hours.ts
// Real (Supabase) implementation

import { supabase } from "../supabaseClient"; // If you don't have the @ alias, use: ../../supabaseClient

/** Row shape of the `hours` table */
export type HourEntry = {
  id: string;
  user_id: string;
  date: string;        // ISO date "YYYY-MM-DD"
  minutes: number;     // total minutes
  activity: string;
  notes?: string | null;
  inserted_at: string;
  updated_at: string;
};

// Allow table override via env; default to "hours"
const HOURS_TABLE = String(import.meta.env.VITE_DB_HOURS_TABLE || "hours");

/** Helper: get current user or throw */
async function requireUser() {
  const { data: sessionData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error("[DB] auth.getSession error:", authError);
    throw authError;
  }
  const user = sessionData.session?.user;
  if (!user) {
    const err = new Error("Not authenticated");
    console.warn("[DB] requireUser -> no user");
    throw err;
  }
  return user;
}

/** Get the current user's hours, newest first */
export async function listMyHours(): Promise<HourEntry[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(HOURS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("[DB] listMyHours error", {
      table: HOURS_TABLE,
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    throw error;
  }

  return (data || []) as HourEntry[];
}

/** Add a new hours row for the current user */
export async function addMyHours(input: {
  date: string;
  minutes: number;
  activity: string;
  notes?: string;
}): Promise<HourEntry> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(HOURS_TABLE)
    .insert([{ user_id: user.id, ...input }])
    .select()
    .single();

  if (error) {
    console.error("[DB] addMyHours error", {
      table: HOURS_TABLE,
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    throw error;
  }

  return data as HourEntry;
}
