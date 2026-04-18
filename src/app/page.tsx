"use client";

import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import SuccessState from "@/components/SuccessState";

export default function HomePage() {
  // Track whether the form was submitted successfully, and store the lead ID
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-500 mb-4">
            {/* Simple building icon */}
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 21h18M9 21V7l6-4v18M9 11h6M9 15h6M13 7h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">New Lead Intake</h1>
          <p className="mt-1 text-sm text-gray-500">
            For internal use only · All submissions are saved directly to Google Sheets
          </p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 px-6 py-8 sm:px-10">
          {submittedLeadId ? (
            // Show success screen after a successful submission
            <SuccessState
              leadId={submittedLeadId}
              onReset={() => setSubmittedLeadId(null)}
            />
          ) : (
            // Show the form
            <LeadForm onSuccess={(leadId) => setSubmittedLeadId(leadId)} />
          )}
        </div>

        {/* ── Footer ── */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Data is stored securely in your company Google Sheet.{" "}
          <a
            href="/admin"
            className="underline hover:text-gray-600 transition"
          >
            View all leads →
          </a>
        </p>
      </div>
    </main>
  );
}
