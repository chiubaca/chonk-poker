import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { oneTap } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";

import { env } from "cloudflare:workers";

import * as schema from "@/infrastructure/database/drizzle/schema";

export const auth = betterAuth({
  database: drizzleAdapter(drizzle(env.CHONK_POKER_DB), {
    provider: "sqlite",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Accept bearer tokens from localStorage (for iframe auth)
  bearer: {
    enabled: true,
  },
  trustedOrigins: [
    "https://meet.google.com",
    "https://chonk-poker.chiubaca.com",
    "http://localhost:3000",
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  plugins: [
    oneTap(), // Google One Tap / FedCM sign-in
    tanstackStartCookies(), // must be last
  ],
});
