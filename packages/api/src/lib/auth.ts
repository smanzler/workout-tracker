import db from "../db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";
import * as schema from "../db/auth-schema";
import { createTransport } from "nodemailer";
import { env } from "../env";
import { renderOtpEmail } from "./otp-email";
import { importPKCS8, SignJWT } from "jose";
import { z } from "zod";

const mailer = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
});

const googleEnv = z
  .object({ GOOGLE_CLIENT_ID: z.string(), GOOGLE_CLIENT_SECRET: z.string() })
  .safeParse(env);

const appleEnv = z
  .object({
    APPLE_CLIENT_ID: z.string(),
    APPLE_TEAM_ID: z.string(),
    APPLE_KEY_ID: z.string(),
    APPLE_PRIVATE_KEY: z.string(),
    APPLE_APP_BUNDLE_IDENTIFIER: z.string(),
  })
  .safeParse(env);

/** Signs the client secret that Apple asks for, with the team's private key. */
const generateAppleClientSecret = async ({
  APPLE_PRIVATE_KEY,
  APPLE_KEY_ID,
  APPLE_TEAM_ID,
  APPLE_CLIENT_ID,
}: {
  APPLE_PRIVATE_KEY: string;
  APPLE_KEY_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_CLIENT_ID: string;
}) => {
  const key = await importPKCS8(APPLE_PRIVATE_KEY, "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: APPLE_KEY_ID })
    .setIssuer(APPLE_TEAM_ID)
    .setSubject(APPLE_CLIENT_ID)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
};

const isReviewSignIn = (email: string, type: string) =>
  type === "sign-in" &&
  env.REVIEW_EMAIL !== undefined &&
  env.REVIEW_OTP !== undefined &&
  email === env.REVIEW_EMAIL;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  plugins: [
    expo(),
    emailOTP({
      generateOTP: ({ email, type }) =>
        isReviewSignIn(email, type) ? env.REVIEW_OTP : undefined,
      async sendVerificationOTP({ email, otp, type }) {
        if (isReviewSignIn(email, type)) return;

        const subject =
          type === "sign-in" ? "Your sign in code" : "Verify your email";

        const { html, text } = renderOtpEmail({
          otp,
          heading: subject,
          expiresInMinutes: 5,
        });

        await mailer.sendMail({
          from: env.SMTP_FROM,
          to: email,
          subject,
          html,
          text,
        });
      },
    }),
  ],
  trustedOrigins: ["com.sigh10.workouttracker://", "https://appleid.apple.com"],
  // A provider is on only when all of its variables are set.
  socialProviders: {
    ...(googleEnv.success && {
      google: {
        clientId: googleEnv.data.GOOGLE_CLIENT_ID,
        clientSecret: googleEnv.data.GOOGLE_CLIENT_SECRET,
      },
    }),
    ...(appleEnv.success && {
      apple: async () => ({
        clientId: appleEnv.data.APPLE_CLIENT_ID,
        clientSecret: await generateAppleClientSecret(appleEnv.data),
        appBundleIdentifier: appleEnv.data.APPLE_APP_BUNDLE_IDENTIFIER,
      }),
    }),
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
