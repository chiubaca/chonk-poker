import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { auth } from "@/infrastructure/auth/auth";

export const getUserSessionFn = createServerFn().handler(async () => {
	// const header = getRequestHeader("Cookie");
	const req = getRequest();
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return session;
});
