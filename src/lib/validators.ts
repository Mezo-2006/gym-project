import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["COACH", "CLIENT"]),
    name: z.string().min(2),
    coachId: z.string().optional(),
    caloriesTarget: z.number().int().positive().optional(),
    proteinTarget: z.number().int().positive().optional(),
    carbsTarget: z.number().int().positive().optional(),
    fatsTarget: z.number().int().positive().optional(),
    waterTargetMl: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "CLIENT") {
      if (!data.coachId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coachId"], message: "Coach is required" });
      }
      [
        "caloriesTarget",
        "proteinTarget",
        "carbsTarget",
        "fatsTarget",
        "waterTargetMl",
      ].forEach((field) => {
        if (data[field as keyof typeof data] === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: "Required",
          });
        }
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const mealLogSchema = z.object({
  clientId: z.string().optional(),
  date: z.string().datetime(),
  foodName: z.string().min(1),
  quantity: z.string().min(1),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fats: z.number().int().nonnegative(),
});

export const waterLogSchema = z.object({
  clientId: z.string().optional(),
  date: z.string().datetime(),
  amountMl: z.number().int().positive(),
});

export const weightLogSchema = z.object({
  clientId: z.string().optional(),
  date: z.string().datetime(),
  weightKg: z.number().positive(),
  bodyFatPct: z.number().min(0).max(100).optional(),
});

export const photoLogSchema = z.object({
  clientId: z.string().optional(),
  date: z.string().datetime(),
  imageUrl: z.string().url(),
  notes: z.string().optional(),
});

export const messageSchema = z.object({
  recipientId: z.string(),
  body: z.string().min(1),
});

export const checkInSchema = z.object({
  clientId: z.string().optional(),
  weekOf: z.string().datetime(),
  formJson: z.record(z.string(), z.any()),
  coachNote: z.string().optional(),
});

export const workoutLogSchema = z.object({
  clientId: z.string().optional(),
  date: z.string().datetime(),
  title: z.string().min(1),
  details: z.record(z.string(), z.any()),
});
