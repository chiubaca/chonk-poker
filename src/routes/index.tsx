import { and, eq } from "drizzle-orm";
import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { nanoid } from "nanoid";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { SignIn } from "@/components/SignIn";
import { UserRoomsList } from "@/components/UserRoomsList";
import { newUsersToRoomsTable, roomTable } from "@/drizzle/schema";
import { signIn, signOut } from "@/lib/auth-client";
import { getDb } from "@/lib/database";
import { getUserSessionFn } from "@/server-functions/get-session";

export const Route = createFileRoute("/")({
	component: RouteComponent,
	loader: async () => {
		const sessions = await getUserSessionFn();
		return {
			sessions,
		};
	},
});

const FormFieldsEnum = {
	USER_ID: "userID",
	USER_NAME: "userName",
	ROOM_ID: "roomId",
};

export const handleCreateRoomServerFn = createServerFn({ method: "POST" })
	.inputValidator((formData) => {
		if (!(formData instanceof FormData)) {
			throw new Error("Expected FormData");
		}

		return {
			userName: formData.get(FormFieldsEnum.USER_NAME)?.toString() || "",
			userId: formData.get(FormFieldsEnum.USER_ID)?.toString() || "",
		};
	})
	.handler(async ({ data }) => {
		const { userId, userName } = data;
		const user = { id: userId, name: userName };

		const newRoomId = nanoid(5).toUpperCase();
		const db = getDb();

		await db
			.insert(roomTable)
			.values({
				id: newRoomId,
				status: "live",
			})
			.onConflictDoUpdate({
				target: roomTable.id,
				set: {
					id: newRoomId,
					status: "live",
				},
			});
		await db.insert(newUsersToRoomsTable).values({ roomId: newRoomId, userId });

		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(newRoomId);
		await stub.createRoom(user);

		return { roomId: newRoomId };
	});

export const handleJoinRoomServerFn = createServerFn({ method: "POST" })
	.inputValidator((formData) => {
		if (!(formData instanceof FormData)) {
			throw new Error("Expected FormData");
		}

		const roomId = formData.get(FormFieldsEnum.ROOM_ID)?.toString() || "";
		if (!roomId) {
			throw new Error("Room ID is required");
		}

		return {
			userName: formData.get(FormFieldsEnum.USER_NAME)?.toString() || "",
			userId: formData.get(FormFieldsEnum.USER_ID)?.toString() || "",
			roomId,
		};
	})
	.handler(async ({ data }) => {
		const { userId, userName, roomId } = data;
		const user = { id: userId, name: userName };

		const db = getDb();

		// Check if user is already in the room
		const existingRecord = await db
			.select()
			.from(newUsersToRoomsTable)
			.where(
				and(
					eq(newUsersToRoomsTable.roomId, roomId),
					eq(newUsersToRoomsTable.userId, userId),
				),
			)
			.limit(1);

		// Only insert if no existing record
		if (existingRecord.length === 0) {
			await db.insert(newUsersToRoomsTable).values({ roomId, userId });
		}

		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
		await stub.gameAction({
			player: { ...user, state: "choosing" },
			type: "player.join",
		});

		return { roomId };
	});

function RouteComponent() {
	const { sessions } = Route.useLoaderData();
	const router = useRouter();

	const createRoomMutation = useMutation({
		mutationFn: handleCreateRoomServerFn,
		onSuccess: (data) => {
			router.navigate({
				to: "/room/$roomId",
				params: { roomId: data.roomId },
			});
		},
	});

	const joinRoomMutation = useMutation({
		mutationFn: handleJoinRoomServerFn,
		onSuccess: (data) => {
			router.navigate({
				to: "/room/$roomId",
				params: { roomId: data.roomId },
			});
		},
	});

	const handleCreateRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (!sessions) return;

		const formData = new FormData();
		formData.append(FormFieldsEnum.USER_NAME, sessions.user.name);
		formData.append(FormFieldsEnum.USER_ID, sessions.user.id);

		createRoomMutation.mutate({ data: formData });
	};

	const handleJoinRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (!sessions) return;

		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		formData.append(FormFieldsEnum.USER_NAME, sessions.user.name);
		formData.append(FormFieldsEnum.USER_ID, sessions.user.id);

		joinRoomMutation.mutate({ data: formData });
	};

	if (!sessions) {
		return <SignIn signIn={signIn} />;
	}

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="card card-border w-full max-w-md bg-base-300 mt-[30vh]">
				<div className="card-body">
					<div className="flex justify-between items-center mb-4">
						<div className="flex items-center gap-2">
							<UserIcon className="w-4 h-4 opacity-70" />
							<span>Hello, {sessions.user.name}</span>
						</div>
						<button
							type="button"
							className="btn btn-ghost btn-xs "
							onClick={() => signOut()}
						>
							Logout
						</button>
					</div>

					{/* Create Room Form */}
					<form
						className="flex flex-col gap-4 mb-6"
						onSubmit={handleCreateRoom}
					>
						<input
							hidden
							id={FormFieldsEnum.USER_NAME}
							name={FormFieldsEnum.USER_NAME}
							type="text"
							value={sessions.user.name}
						/>
						<input
							hidden
							id={FormFieldsEnum.USER_ID}
							name={FormFieldsEnum.USER_ID}
							type="text"
							value={sessions.user.id}
						/>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={createRoomMutation.isPending}
						>
							{createRoomMutation.isPending
								? "Processing..."
								: "Create new room"}
						</button>
					</form>

					<div className="divider">OR</div>

					{/* Join Room Form */}
					<form className="flex flex-col gap-4" onSubmit={handleJoinRoom}>
						<input
							hidden
							id={FormFieldsEnum.USER_NAME}
							name={FormFieldsEnum.USER_NAME}
							type="text"
							value={sessions.user.name}
						/>
						<input
							hidden
							id={FormFieldsEnum.USER_ID}
							name={FormFieldsEnum.USER_ID}
							type="text"
							value={sessions.user.id}
						/>
						<div className="flex flex-col gap-2">
							<label className="input flex items-center gap-2 w-full">
								<HashIcon className="w-4 h-4 opacity-70" />
								<input
									id={FormFieldsEnum.ROOM_ID}
									name={FormFieldsEnum.ROOM_ID}
									type="text"
									placeholder="Enter room ID"
									className="grow"
									required
								/>
							</label>
						</div>
						<button
							type="submit"
							className="btn btn-secondary"
							disabled={joinRoomMutation.isPending}
						>
							{joinRoomMutation.isPending
								? "Processing..."
								: "Join Existing Room"}
						</button>
					</form>
				</div>
			</div>

			<div className="min-w-md">
				<UserRoomsList />
			</div>
		</div>
	);
}
