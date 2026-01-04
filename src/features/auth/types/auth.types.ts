export type AuthUser = {
	id: string;
	name: string;
	email: string;
	image?: string;
};

export type AuthSession = {
	user: AuthUser;
} | null;
