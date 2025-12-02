import config from "@/constants/config";
import { Role } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { sendMagicLinkAfterCreate } from "@/services/auth-email";
import { userEmailExists } from "@/services/users";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, { AuthOptions, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

/** ---------- Email helpers (customize branding here) ---------- */

function emailSubject(host: string) {
  return `Sign in to ${host} • yFL`;
}

function emailText(url: string, host: string) {
  return `Sign in to ${host}\n\n${url}\n\n\
This one-time link will expire soon. If you didn’t request it, you can safely ignore this email.`;
}

type EmailHtmlParams = {
  url: string;
  host: string;
  product?: string;
  accent?: string;
  logoUrl?: string; // absolute https url optional
};

function emailHtml({
  url,
  host,
  product = "yFL",
  accent = "#4f46e5",
  logoUrl,
}: EmailHtmlParams) {
  const logoBlock = logoUrl
    ? `<tr><td align="center" style="padding-bottom:16px;">
         <img src="${logoUrl}" alt="${product} logo" width="48" height="48" style="display:block;border:0" />
       </td></tr>`
    : "";

  return `<!doctype html>
    <html>
      <head>
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sign in to ${product}</title>
      </head>
      <body style="margin:0;background:#f6f7f9;padding:24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;">
          <tr><td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;padding:32px;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;color:#0f172a;">
              ${logoBlock}
              <tr><td align="center" style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Sign in to ${product}</td></tr>
              <tr><td align="center" style="padding-top:6px;font-size:14px;color:#6b7280;">Host: ${host}</td></tr>
              <tr><td align="center" style="padding-top:24px;">
                <a href="${url}" style="display:inline-block;padding:14px 22px;font-weight:600;border-radius:10px;background:${accent};color:#ffffff;text-decoration:none;">Sign in</a>
              </td></tr>
              <tr><td align="center" style="font-size:12px;color:#6b7280;padding-top:8px;">This magic link expires soon and can be used once.</td></tr>
              <tr><td style="padding-top:24px;font-size:14px;line-height:1.6;">
                If the button doesn’t work, copy and paste this URL:<br/>
                <span style="word-break:break-all;color:#374151;">${url}</span>
              </td></tr>
              <tr><td style="padding-top:24px;font-size:12px;color:#6b7280;">Didn’t request this? Ignore this email.</td></tr>
            </table>
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="padding:16px;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
              <tr><td align="center" style="font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${product}. All rights reserved.</td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;
}

/** ---------- Custom mailer ---------- */

const transporter = nodemailer.createTransport({
  host: config.nextAuth.email.server.host,
  port: config.nextAuth.email.server.port,
  secure: config.nextAuth.email.server.port === 465,
  auth: {
    user: config.nextAuth.email.server.user,
    pass: config.nextAuth.email.server.pass,
  },
});

const authConfig: AuthOptions = {
  // @ts-expect-error - Type mismatch between @auth/core versions in dependencies
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/signin",
    error: "/invalid-email", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      server: {
        host: config.nextAuth.email.server.host,
        port: config.nextAuth.email.server.port,
        auth: {
          user: config.nextAuth.email.server.user,
          pass: config.nextAuth.email.server.pass,
        },
      },
      from: config.nextAuth.email.from,
      maxAge: 60 * 60, // 1 hour

      async sendVerificationRequest({ identifier, url, provider }) {
        const host = new URL(url).host;

        try {
          await transporter.sendMail({
            to: identifier,
            from: provider.from,
            subject: emailSubject(host),
            text: emailText(url, host),
            html: emailHtml({
              url,
              host,
              product: "yFL",
              accent: "#4f46e5",
              logoUrl: `${config.publicUrl}/email/logo.png`,
            }),
            headers: { "X-Entity-Ref-ID": Date.now().toString() },
          });

          console.log("[NextAuth] Magic link sent to", identifier);
        } catch (err) {
          console.error("[NextAuth] Error sending magic link to", identifier, err);
          throw err;
        }
      },
    }),
  ],

  events: {
    async createUser({ user }) {
      // Send sign-in email immediately when user is created
      try {
        if (user.email) {
          await sendMagicLinkAfterCreate(user.email);
          console.log(
            "[NextAuth] Magic link requested for new user:",
            user.email
          );
        } else {
          console.warn(
            "[NextAuth] User created without email — cannot send magic link"
          );
        }
      } catch (err) {
        console.error(
          "[NextAuth] Failed to send magic link after user creation:",
          err
        );
      }
    },
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, organizationId: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
        }
      }

      return token;
    },

    async signIn({ user, account, email }) {
      if (account?.provider === "email" && email?.verificationRequest) {
        if (!user?.email) return false;
        const exists = await userEmailExists(user.email);
        if (!exists) return false;
      }

      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
};

export const handlers = NextAuth(authConfig);

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authConfig);
}
