"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Map column index → header name from the sheet
// The order matches SHEET_HEADERS in google-sheets.ts
const COLUMNS = [
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
  "Consent",
];

// Which columns to show in the compact table (others are in a detail row)
const VISIBLE_COLUMNS = [1, 2, 3, 4, 7, 8, 9, 10, 14]; // Submitted, Name, Phone, Email, Intent, Type, Location, Budget, Agent

export default function AdminPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load leads.");
        const data = await res.json();
        // Skip the first row — it's the header row from the sheet
        const dataRows = (data.rows as string[][]).slice(1);
        setRows(dataRows);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Format ISO timestamp to a readable local date/time
  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">Live data from Google Sheets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700
                shadow-sm hover:bg-gray-50 transition"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white
                shadow-sm hover:bg-brand-600 transition"
            >
              + New Lead
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            Loading leads…
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 py-24 text-center text-gray-400 text-sm">
            No leads yet. Submit the first one using the form.
          </div>
        )}

        {/* Table */}
        {!loading && !error && rows.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {VISIBLE_COLUMNS.map((colIdx) => (
                      <th
                        key={colIdx}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {COLUMNS[colIdx]}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <>
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      >
                        {VISIBLE_COLUMNS.map((colIdx) => (
                          <td key={colIdx} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                            {colIdx === 1 ? formatDate(row[colIdx] ?? "") : (row[colIdx] ?? "—")}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-brand-500 text-xs font-medium whitespace-nowrap">
                          {expandedRow === i ? "▲ Hide" : "▼ Show"}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedRow === i && (
                        <tr key={`${i}-detail`} className="bg-brand-50">
                          <td colSpan={VISIBLE_COLUMNS.length + 1} className="px-4 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {COLUMNS.map((col, colIdx) => (
                                <div key={colIdx}>
                                  <span className="block text-xs font-semibold text-gray-500 uppercase">{col}</span>
                                  <span className="text-sm text-gray-800 break-words">
                                    {colIdx === 1 ? formatDate(row[colIdx] ?? "") : (row[colIdx] || "—")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              {rows.length} lead{rows.length !== 1 ? "s" : ""} total
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
