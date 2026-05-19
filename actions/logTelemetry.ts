"use server";

// actions/logTelemetry.ts — netpaytool.com
// Server Action: inserts one row per calculate click. Never awaited in the UI.
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface NetPayTelemetry {
  annual_income: number;
  debt_amount: number;
  filing_status_code: 0 | 1 | 2; // 0=single 1=married 2=hoh
  pay_period_code: number;        // 1=weekly 2=biweekly 4=semi 12=monthly 0=annual
  state_code: string;
}

export async function logTelemetry(data: NetPayTelemetry): Promise<void> {
  const supabase = getClient();
  if (!supabase) return; // silently skip if env vars not set yet

  const { error } = await supabase.from("calculator_telemetry").insert({
    app_source: "netpaytool.com",
    input_data: data,
  });

  if (error) {
    console.error("[telemetry:netpaytool]", error.message);
  }
}
