import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.BETTER_AUTH_URL,
});

export const signIn = async () => {
	await authClient.signIn.social({
		provider: "google",
	});
};

export const signOut = async () => {
	await authClient.signOut();
	window.location.reload();
};
