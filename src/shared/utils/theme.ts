import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const THEME_COOKIE_NAME = "theme";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const themes = [
	{ value: "dracula", label: "Dark" },
	{ value: "light", label: "Light" },
	{ value: "cupcake", label: "Cupcake" },
	{ value: "retro", label: "Retro" },
	{ value: "cyberpunk", label: "Cyberpunk" },
	{ value: "valentine", label: "Valentine" },
	{ value: "aqua", label: "Aqua" },
];

export const getThemeFromCookies = (): string => {
	if (typeof document === "undefined") return "dracula";

	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split("=");
		if (name === THEME_COOKIE_NAME) {
			const decodedValue = decodeURIComponent(value);
			if (themes.some((theme) => theme.value === decodedValue)) {
				return decodedValue;
			}
		}
	}
	return "default";
};

export const setThemeCookie = (theme: string): void => {
	if (typeof document === "undefined") return;

	const encodedValue = encodeURIComponent(theme);
	document.cookie = `${THEME_COOKIE_NAME}=${encodedValue}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=strict`;
};

export const getThemeFromServer = (cookieHeader?: string): string => {
	if (!cookieHeader) return "default";

	const cookies = cookieHeader.split(";");
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split("=");
		if (name === THEME_COOKIE_NAME) {
			const decodedValue = decodeURIComponent(value);
			if (themes.some((theme) => theme.value === decodedValue)) {
				return decodedValue;
			}
		}
	}
	return "dracula";
};

export const getThemeServerFn = createServerFn().handler(async () => {
	const req = getRequest();
	const cookieHeader = req.headers.get("cookie") || undefined;
	return getThemeFromServer(cookieHeader);
});
