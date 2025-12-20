import { nanoid } from "nanoid";
import z from "zod";

import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";

export const USER_COOKIE_KEY_ENUM = {
	USER_ID: "user_id",
	USERNAME: "user_name",
} as const;

const UserSchema = z.object({
	userId: z.string(),
	userName: z.string(),
});

export const createNewUserServerFn = createServerFn()
	.inputValidator(z.object({ userName: z.string() }))
	.handler(({ data }) => {
		const userId = nanoid();

		setCookie(USER_COOKIE_KEY_ENUM.USER_ID, userId);
		setCookie(USER_COOKIE_KEY_ENUM.USERNAME, data.userName);
		return { userId, userName: data.userName };
	});

export const setUserServerFn = createServerFn()
	.inputValidator(UserSchema)
	.handler(({ data }) => {
		setCookie(USER_COOKIE_KEY_ENUM.USER_ID, data.userId);
		setCookie(USER_COOKIE_KEY_ENUM.USERNAME, data.userName);
	});

export const getUserServerFn = createServerFn().handler(() => {
	const cookies = getCookies();

	if (
		!cookies[USER_COOKIE_KEY_ENUM.USER_ID] ||
		!cookies[USER_COOKIE_KEY_ENUM.USERNAME]
	) {
		return null;
	}

	return {
		userName: cookies[USER_COOKIE_KEY_ENUM.USERNAME],
		userId: cookies[USER_COOKIE_KEY_ENUM.USER_ID],
	};
});

export const logoutUserServerFn = createServerFn().handler(() => {
	setCookie(USER_COOKIE_KEY_ENUM.USER_ID, "", {
		expires: new Date(0),
	});
	setCookie(USER_COOKIE_KEY_ENUM.USERNAME, "", {
		expires: new Date(0),
	});

	throw redirect({ to: "/" });
});
