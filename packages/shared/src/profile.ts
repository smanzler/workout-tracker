import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(30, "Use at most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers and underscores");
