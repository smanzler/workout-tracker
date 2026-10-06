import db from "../db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";
import * as schema from "../db/auth-schema";
import { createTransport } from "nodemailer";
import { env } from "../env";
import { renderOtpEmail } from "./otp-email";

const mailer = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
});

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
  trustedOrigins: ["com.sigh10.workouttracker://"],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
