export type PasswordAssessment = {
  label: "Too short" | "Basic" | "Strong";
  meetsMinimum: boolean;
  guidance: string;
};

/** Client-side UX guidance only; Supabase remains authoritative. */
export function assessPassword(password: string): PasswordAssessment {
  if (password.length < 8) {
    return { label: "Too short", meetsMinimum: false, guidance: "Use at least 8 characters." };
  }

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((pattern) => pattern.test(password)).length;
  if (password.length >= 14 && variety >= 3) {
    return { label: "Strong", meetsMinimum: true, guidance: "A longer, unique passphrase is a good choice." };
  }

  return { label: "Basic", meetsMinimum: true, guidance: "Consider a longer, unique passphrase." };
}
