"use server";

// actions/captureEmail.ts — netpaytool.com

import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function captureEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!email || !email.includes("@")) return { ok: false, error: "Invalid email" };

  const supabase = getClient();
  if (!supabase) return { ok: false, error: "Service unavailable" };

  const { error } = await supabase.from("email_captures").insert({
    email: email.trim().toLowerCase(),
    calculator_type: "take_home_pay",
    source: "netpaytool.com",
  });

  if (error) {
    if (error.code === "23505") return { ok: true };
    console.error("[email:netpaytool]", error.message);
    return { ok: false, error: "Could not save. Try again." };
  }

  return { ok: true };
}
