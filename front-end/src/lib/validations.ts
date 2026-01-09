import { z } from "zod";

// Singapore phone number regex - supports various formats
// +65 XXXX XXXX, 65XXXXXXXX, XXXX XXXX, XXXXXXXX
const sgPhoneRegex = /^(\+65\s?)?[689]\d{3}\s?\d{4}$/;

// ============================================
// BOOKING FORM VALIDATION SCHEMA
// ============================================
export const bookingFormSchema = z.object({
  // Customer Information
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  
  mobile: z
    .string()
    .min(8, "Please enter a valid phone number")
    .regex(sgPhoneRegex, "Please enter a valid Singapore phone number (e.g., 9123 4567 or +65 9123 4567)"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is required")
    .max(255, "Email must be less than 255 characters"),
  
  existingClient: z.enum(["yes", "no", ""]).optional(),
  
  // Address & Property
  address: z
    .string()
    .min(10, "Please enter a complete address")
    .max(500, "Address must be less than 500 characters"),
  
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit Singapore postal code")
    .optional()
    .or(z.literal("")),
  
  propertyType: z.enum([
    "hdb",
    "condo",
    "apartment",
    "landed",
    "office",
    "shoplot",
    "industrial",
    "others",
    "",
  ]).optional(),
  
  // Service Selection
  serviceType: z.enum([
    "normal",
    "chemical",
    "steam",
    "overhaul",
    "repair",
    "installation",
    "contract",
    "",
  ], {
    errorMap: () => ({ message: "Please select a service type" }),
  }),
  
  numberOfUnits: z
    .number()
    .min(1, "Number of units must be at least 1")
    .max(100, "Number of units must be less than 100")
    .optional()
    .or(z.nan()),
  
  brand: z.enum([
    "daikin",
    "toshiba",
    "panasonic",
    "midea",
    "mitsubishi-electric",
    "mhi",
    "gree",
    "york",
    "dunham-bush",
    "others",
    "",
  ]).optional(),
  
  // Schedule
  preferredDate: z
    .date({
      errorMap: () => ({ message: "Please select a preferred date" }),
    })
    .refine(
      (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Please select a date in the future"
    )
    .optional(),
  
  timeSlot: z.enum([
    "9-10",
    "10-12",
    "12-2",
    "2-4",
    "4-6",
    "6-7",
    "",
  ]).optional(),
  
  // Additional
  remarks: z
    .string()
    .max(1000, "Remarks must be less than 1000 characters")
    .optional(),
  
  // PDPA Consent
  pdpaConsent: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to be contacted by Promach to proceed",
    }),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// ============================================
// CONTACT FORM VALIDATION SCHEMA
// ============================================
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is required"),
  
  phone: z
    .string()
    .regex(sgPhoneRegex, "Please enter a valid Singapore phone number")
    .optional()
    .or(z.literal("")),
  
  subject: z
    .string()
    .max(200, "Subject must be less than 200 characters")
    .optional(),
  
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================
// QUOTE REQUEST VALIDATION SCHEMA
// ============================================
export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().regex(sgPhoneRegex, "Valid Singapore phone number required"),
  propertyType: z.string().min(1, "Property type is required"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(20, "Please provide more details (at least 20 characters)"),
});

export type QuoteRequestData = z.infer<typeof quoteRequestSchema>;
