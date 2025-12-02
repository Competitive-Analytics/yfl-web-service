// src/services/authEmail.ts
import config from "@/constants/config";

/**
 * Request a NextAuth email magic link for the given email.
 * This hits the same route that `signIn("email")` uses.
 */
export async function sendMagicLinkAfterCreate(email: string) {
  const baseUrl = config.publicUrl;

  if (!baseUrl) {
    console.error(
      "[authEmail] Missing config.publicUrl. Cannot send magic link."
    );
    return;
  }

  const url = new URL("/api/auth/signin/email", baseUrl);

  const body = new URLSearchParams({
    email,
    callbackUrl: baseUrl, // or `${baseUrl}/dashboard` if you want
  });

  await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}
