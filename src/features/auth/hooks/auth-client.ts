import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.BETTER_AUTH_URL,
  plugins: [
    oneTapClient({
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    }),
  ],
});

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};

export const signInWithOneTap = async () => {
  await authClient.oneTap({
    callbackURL: window.location.href,
  });
};

export const signOut = async () => {
  await authClient.signOut();
  window.location.reload();
};
