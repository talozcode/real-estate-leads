// Represents the raw data submitted by the user in the form
export interface LeadFormData {
  fullName: string;
  phone: string;
  email: string;
  contactMethod: "phone" | "email" | "whatsapp";
  nationality: string;
  intent: "buying" | "selling" | "renting";
  propertyType: string;
  preferredLocation: string;
  budget: string;
  bedrooms: string;
  timeline: string;
  leadSource: string;
  notes: string;
  assignedAgent: string;
  consent: boolean;
}

// A saved lead — extends the form data with auto-generated fields
export interface LeadRecord extends LeadFormData {
  id: string;          // e.g. "LEAD-A3F9B1C2"
  submittedAt: string; // ISO 8601 timestamp
}

// A single validation error returned from the server or client
export interface ValidationError {
  field: keyof LeadFormData;
  message: string;
}

// API response shape for a successful submission
export interface SubmitSuccessResponse {
  success: true;
  leadId: string;
}

// API response shape for a failed submission
export interface SubmitErrorResponse {
  error?: string;
  errors?: ValidationError[];
}
