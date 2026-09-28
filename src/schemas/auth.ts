import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
  mfaCode: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    organizationName: z
      .string()
      .min(1, "Organization name is required")
      .min(2, "Organization name must be at least 2 characters")
      .max(100, "Organization name is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^a-zA-Z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^a-zA-Z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// ── Password strength ──────────────────────────────────────────────────────

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

export function getPasswordStrength(password: string): StrengthResult {
  const checks = [
    { label: "At least 8 characters",  passed: password.length >= 8 },
    { label: "Uppercase letter",        passed: /[A-Z]/.test(password) },
    { label: "Number",                  passed: /[0-9]/.test(password) },
    { label: "Special character",       passed: /[^a-zA-Z0-9]/.test(password) },
    { label: "12+ characters",          passed: password.length >= 12 },
  ];
  const score = checks.filter((c) => c.passed).length as 0 | 1 | 2 | 3 | 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"] as const;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"] as const;
  return { score, label: labels[score] ?? "", color: colors[score] ?? "", checks };
}
