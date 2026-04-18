import { google } from "googleapis";
import { LeadRecord } from "@/types/lead";

/**
 * Column headers for the Google Sheet, in the exact order they'll appear.
 * If you add a column here, also add the matching value in rowValues below.
 */
export const SHEET_HEADERS = [
  "Lead ID",
  "Submitted At",
  "Full Name",
  "Phone",
  "Email",
  "Contact Method",
  "Nationality",
  "Intent",
  "Property Type",
  "Preferred Location",
  "Budget",
  "Bedrooms",
  "Timeline",
  "Lead Source",
  "Assigned Agent",
  "Notes",
  "Consent Given",
];

/**
 * Builds an authenticated Google Sheets client using service account credentials
 * stored in environment variables. This runs server-side only — credentials are
 * never sent to the browser.
 */
function getSheetsClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable."
    );
  }

  // Parse the entire service account JSON stored as one env var
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Appends one lead as a new row in the Google Sheet.
 * If the sheet is empty, it writes the header row first.
 */
export async function appendLeadToSheet(lead: LeadRecord): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      "GOOGLE_SHEET_ID is not set. Add it to your .env.local file."
    );
  }

  // Check whether the sheet already has a header row
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A1:A1",
  });

  const isEmpty = !existing.data.values || existing.data.values.length === 0;

  if (isEmpty) {
    // Write headers on the very first submission
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: [SHEET_HEADERS] },
    });
  }

  // Build a row in the same column order as SHEET_HEADERS
  const rowValues = [
    lead.id,
    lead.submittedAt,
    lead.fullName,
    lead.phone,
    lead.email,
    lead.contactMethod,
    lead.nationality,
    lead.intent,
    lead.propertyType,
    lead.preferredLocation,
    lead.budget,
    lead.bedrooms,
    lead.timeline,
    lead.leadSource,
    lead.assignedAgent,
    lead.notes,
    lead.consent ? "Yes" : "No",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowValues] },
  });
}

/**
 * Fetches all rows from the sheet, including the header row.
 * Returns a 2D array: rows[0] = headers, rows[1..n] = data rows.
 */
export async function getLeadsFromSheet(): Promise<string[][]> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID is not set.");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1",
  });

  return (response.data.values as string[][]) || [];
}
