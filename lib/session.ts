import { NextApiRequest } from "next";
import { Handler, Session, withIronSession } from "next-iron-session";

const password =
  process.env.AUTH_SECRET_COOKIE_PASSWORD || "finc_super_secret_iron_password";
const cookieName = process.env.AUTH_COOKIE_NAME || "finc_auth_cookie";
export const SESSION_KEY = process.env.AUTH_SESSION_KEY || "user";

export interface NextApiRequestWithSession<T = any> extends NextApiRequest {
  session: Session;
  body: T;
}

function enforceMinPasswordLength(pw: string) {
  return pw.padEnd(32, "@");
}

export default function withSession(handler: Handler): () => Promise<any> {
  return withIronSession(handler, {
    password: enforceMinPasswordLength(password),
    cookieName,
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
}