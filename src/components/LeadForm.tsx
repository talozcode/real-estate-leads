"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { LeadFormData, ValidationError, SubmitSuccessResponse, SubmitErrorResponse } from "@/types/lead";
import { validateLead } from "@/lib/validation";

// ── Option lists ──────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
  { value: "phone",    label: "Phone Call" },
  { value: "email",    label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

const INTENTS = [
  { value: "buying",  label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "renting", label: "Renting" },
];

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Land / Plot",
  "Commercial",
  "Penthouse",
  "Studio",
  "Other",
];

const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5+", "N/A (Commercial / Land)"];

const TIMELINES = [
  "Immediately",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "More than 1 year",
  "Not sure yet",
];

const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Walk-in",
  "Social Media (Instagram / Facebook)",
  "Property Portal (Bayut / Property Finder / Dubizzle)",
  "Google Ads",
  "Cold Call",
  "Event / Exhibition",
  "Other",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeadFormProps {
  onSuccess: (leadId: string) => void;
}

const EMPTY_FORM: LeadFormData = {
  fullName: "",
  phone: "",
  email: "",
  contactMethod: "phone",
  nationality: "",
  intent: "buying",
  propertyType: "",
  preferredLocation: "",
  budget: "",
  bedrooms: "",
  timeline: "",
  leadSource: "",
  notes: "",
  assignedAgent: "",
  consent: false,
};

// ── Helper components ─────────────────────────────────────────────────────────

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
  "placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-500/30 transition";

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition";

const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-300/30";

// ── Main component ────────────────────────────────────────────────────────────

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generic handler for text inputs and selects
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    // Clear the error for this field as the user types
    if (clientErrors[name]) {
      setClientErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    // Run client-side validation first for instant feedback
    const validationErrors = validateLead(form);
    if (validationErrors.length > 0) {
      const map: Record<string, string> = {};
      validationErrors.forEach((err: ValidationError) => { map[err.field] = err.message; });
      setClientErrors(map);
      // Scroll to the first error
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = (await res.json()) as SubmitSuccessResponse;
        onSuccess(data.leadId);
      } else {
        const data = (await res.json()) as SubmitErrorResponse;

        if (data.errors && data.errors.length > 0) {
          const map: Record<string, string> = {};
          data.errors.forEach((err: ValidationError) => { map[err.field] = err.message; });
          setClientErrors(map);
        } else {
          setServerError(data.error ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function err(field: string) {
    return clientErrors[field];
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── Section: Contact Details ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Contact Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Full Name */}
          <div data-error={err("fullName") ? true : undefined}>
            <Label htmlFor="fullName" required>Full Name</Label>
            <input
              id="fullName" name="fullName" type="text"
              placeholder="e.g. Sarah Johnson"
              value={form.fullName} onChange={handleChange}
              className={`${inputClass} ${err("fullName") ? errorInputClass : ""}`}
            />
            <FieldError message={err("fullName")} />
          </div>

          {/* Phone */}
          <div data-error={err("phone") ? true : undefined}>
            <Label htmlFor="phone" required>Phone Number</Label>
            <input
              id="phone" name="phone" type="tel"
              placeholder="e.g. +971 50 123 4567"
              value={form.phone} onChange={handleChange}
              className={`${inputClass} ${err("phone") ? errorInputClass : ""}`}
            />
            <FieldError message={err("phone")} />
          </div>

          {/* Email */}
          <div data-error={err("email") ? true : undefined}>
            <Label htmlFor="email" required>Email Address</Label>
            <input
              id="email" name="email" type="email"
              placeholder="e.g. sarah@email.com"
              value={form.email} onChange={handleChange}
              className={`${inputClass} ${err("email") ? errorInputClass : ""}`}
            />
            <FieldError message={err("email")} />
          </div>

          {/* Preferred Contact Method */}
          <div data-error={err("contactMethod") ? true : undefined}>
            <Label htmlFor="contactMethod" required>Preferred Contact Method</Label>
            <select
              id="contactMethod" name="contactMethod"
              value={form.contactMethod} onChange={handleChange}
              className={`${selectClass} ${err("contactMethod") ? errorInputClass : ""}`}
            >
              {CONTACT_METHODS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FieldError message={err("contactMethod")} />
          </div>

          {/* Nationality */}
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <input
              id="nationality" name="nationality" type="text"
              placeholder="e.g. British"
              value={form.nationality} onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Assigned Agent */}
          <div>
            <Label htmlFor="assignedAgent">Assigned Agent</Label>
            <input
              id="assignedAgent" name="assignedAgent" type="text"
              placeholder="Agent's name"
              value={form.assignedAgent} onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Section: Property Requirements ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Property Requirements
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Intent */}
          <div data-error={err("intent") ? true : undefined}>
            <Label htmlFor="intent" required>Interested In</Label>
            <select
              id="intent" name="intent"
              value={form.intent} onChange={handleChange}
              className={`${selectClass} ${err("intent") ? errorInputClass : ""}`}
            >
              {INTENTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FieldError message={err("intent")} />
          </div>

          {/* Property Type */}
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <select
              id="propertyType" name="propertyType"
              value={form.propertyType} onChange={handleChange}
              className={selectClass}
            >
              <option value="">— Select type —</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Preferred Location */}
          <div>
            <Label htmlFor="preferredLocation">Preferred Location / Area</Label>
            <input
              id="preferredLocation" name="preferredLocation" type="text"
              placeholder="e.g. Dubai Marina, Downtown"
              value={form.preferredLocation} onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget">Budget</Label>
            <input
              id="budget" name="budget" type="text"
              placeholder="e.g. AED 1,500,000 or $5,000/month"
              value={form.budget} onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <Label htmlFor="bedrooms">Number of Bedrooms</Label>
            <select
              id="bedrooms" name="bedrooms"
              value={form.bedrooms} onChange={handleChange}
              className={selectClass}
            >
              <option value="">— Select —</option>
              {BEDROOM_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <Label htmlFor="timeline">Move-in / Purchase Timeline</Label>
            <select
              id="timeline" name="timeline"
              value={form.timeline} onChange={handleChange}
              className={selectClass}
            >
              <option value="">— Select timeline —</option>
              {TIMELINES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Section: Lead Info ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Lead Information
        </h2>
        <div className="grid grid-cols-1 gap-4">

          {/* Lead Source */}
          <div>
            <Label htmlFor="leadSource">Lead Source</Label>
            <select
              id="leadSource" name="leadSource"
              value={form.leadSource} onChange={handleChange}
              className={selectClass}
            >
              <option value="">— How did they hear about us? —</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes" name="notes"
              rows={4}
              placeholder="Any extra details, specific requests, or comments..."
              value={form.notes} onChange={handleChange}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* ── Consent ── */}
      <section>
        <div
          className={`flex items-start gap-3 rounded-lg p-4 border ${
            err("consent") ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
          }`}
          data-error={err("consent") ? true : undefined}
        >
          <input
            id="consent" name="consent" type="checkbox"
            checked={form.consent} onChange={handleChange}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer flex-shrink-0"
          />
          <div>
            <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">I confirm the customer has given consent</span> to be
              contacted by our team regarding their property enquiry.{" "}
              <span className="text-red-500">*</span>
            </label>
            <FieldError message={err("consent")} />
          </div>
        </div>
      </section>

      {/* ── Server-level error banner ── */}
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {serverError}
        </div>
      )}

      {/* ── Submit button ── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white
          shadow-sm hover:bg-brand-600 active:bg-brand-700 focus:outline-none focus:ring-2
          focus:ring-brand-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Lead"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Fields marked <span className="text-red-500">*</span> are required.
      </p>
    </form>
  );
}
