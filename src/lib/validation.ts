import { LeadFormData, ValidationError } from "@/types/lead";

/**
 * Validates the lead form data.
 * Returns an array of errors — empty array means everything is valid.
 * This same function is used on both the server (in the API route) and
 * can be imported into the client for instant feedback.
 */
export function validateLead(data: Partial<LeadFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // --- Required text fields ---
  if (!data.fullName?.trim()) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (!data.phone?.trim()) {
    errors.push({ field: "phone", message: "Phone number is required." });
  } else if (!/^[+\d\s\-(). ]{6,25}$/.test(data.phone.trim())) {
    errors.push({ field: "phone", message: "Please enter a valid phone number." });
  }

  if (!data.email?.trim()) {
    errors.push({ field: "email", message: "Email address is required." });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push({ field: "email", message: "Please enter a valid email address." });
  }

  // --- Required dropdown fields ---
  const validContactMethods = ["phone", "email", "whatsapp"];
  if (!data.contactMethod || !validContactMethods.includes(data.contactMethod)) {
    errors.push({ field: "contactMethod", message: "Please select a contact method." });
  }

  const validIntents = ["buying", "selling", "renting"];
  if (!data.intent || !validIntents.includes(data.intent)) {
    errors.push({ field: "intent", message: "Please select buying, selling, or renting." });
  }

  // --- Consent must be checked ---
  if (!data.consent) {
    errors.push({ field: "consent", message: "You must agree to be contacted to submit." });
  }

  return errors;
}
