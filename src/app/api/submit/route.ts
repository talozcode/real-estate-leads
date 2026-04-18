import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { appendLeadToSheet } from "@/lib/google-sheets";
import { validateLead } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { LeadFormData, LeadRecord } from "@/types/lead";

export async function POST(request: NextRequest) {
  // --- 1. Rate limiting ---
  // Get the client's IP address from request headers
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many submissions. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
      },
      { status: 429 }
    );
  }

  // --- 2. Parse request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  // --- 3. Server-side validation ---
  // We validate server-side even though the client also validates,
  // because anyone can send a request directly to the API.
  const errors = validateLead(body as Partial<LeadFormData>);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const formData = body as LeadFormData;

  // --- 4. Build the full lead record ---
  const lead: LeadRecord = {
    ...formData,
    // Generate a short, human-readable lead ID
    id: `LEAD-${uuidv4().slice(0, 8).toUpperCase()}`,
    // Store the exact submission time in ISO format
    submittedAt: new Date().toISOString(),
  };

  // --- 5. Write to Google Sheets ---
  try {
    await appendLeadToSheet(lead);
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });
  } catch (err) {
    console.error("[/api/submit] Google Sheets error:", err);
    return NextResponse.json(
      { error: "We could not save your information. Please try again or contact the office." },
      { status: 500 }
    );
  }
}
