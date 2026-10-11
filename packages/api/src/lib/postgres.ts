import { z } from "zod";

const postgresErrorSchema = z.object({ code: z.string() });

// Drizzle puts the driver's error in `cause`.
const queryErrorSchema = z.object({ cause: postgresErrorSchema });

/** Whether the error comes from a unique constraint. */
export const isUniqueViolation = (error: unknown) => {
  const direct = postgresErrorSchema.safeParse(error);
  if (direct.success) return direct.data.code === "23505";

  const wrapped = queryErrorSchema.safeParse(error);
  return wrapped.success && wrapped.data.cause.code === "23505";
};
