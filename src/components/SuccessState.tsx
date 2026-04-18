"use client";

interface SuccessStateProps {
  leadId: string;
  onReset: () => void;
}

export default function SuccessState({ leadId, onReset }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Checkmark icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Saved!</h2>
      <p className="text-gray-500 text-sm mb-4 max-w-sm">
        The customer information has been recorded in the Google Sheet.
      </p>

      {/* Lead ID badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 mb-8">
        <span className="text-xs text-gray-500 font-medium">Lead ID</span>
        <span className="font-mono text-sm font-bold text-gray-800">{leadId}</span>
      </div>

      <button
        onClick={onReset}
        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium
          text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        Add Another Lead
      </button>
    </div>
  );
}
