import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "fitflow_token";

export type AuthPayload = {
  sub: string;
  role: "COACH" | "CLIENT";
};

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}
const jwtSecretValue = jwtSecret;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthPayload) {
  return (jwt as any).sign(payload, jwtSecretValue, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  }) as string;
}

export function verifyToken(token: string) {
  return (jwt as any).verify(token, jwtSecretValue) as AuthPayload;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
