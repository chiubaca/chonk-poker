export type Room = {
	id: string;
	status: "live" | "archived";
	createdAt?: Date;
	updatedAt?: Date;
};

export type UserRoom = {
	roomId: string;
	status: string | null;
};

export type CreateRoomRequest = {
	userId: string;
	userName: string;
};

export type JoinRoomRequest = {
	userId: string;
	userName: string;
	roomId: string;
};
