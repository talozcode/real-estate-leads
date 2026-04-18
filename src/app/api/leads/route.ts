import { NextResponse } from "next/server";
import { getLeadsFromSheet } from "@/lib/google-sheets";

/**
 * GET /api/leads
 * Returns all rows from the Google Sheet as a 2D array.
 * Row 0 contains the headers; rows 1+ are data.
 *
 * This endpoint is unprotected for simplicity (internal tool).
 * If you need security, add a check for a secret token in the
 * request headers: e.g. `if (request.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN)`
 */
export async function GET() {
  try {
    const rows = await getLeadsFromSheet();
    return NextResponse.json({ rows }, { status: 200 });
  } catch (err) {
    console.error("[/api/leads] Error fetching from Google Sheets:", err);
    return NextResponse.json(
      { error: "Failed to load leads from the sheet." },
      { status: 500 }
    );
  }
}
