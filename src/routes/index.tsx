import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { SignIn } from "@/features/auth/components";
import { signIn, signOut } from "@/features/auth/hooks/auth-client";
import { getUserSessionFn } from "@/features/auth/server-functions/get-session";
import { UserRoomsList } from "@/features/rooms/components";
import { getDb } from "@/infrastructure/database/database";
import {
	newUsersToRoomsTable,
	roomTable,
} from "@/infrastructure/database/drizzle/schema";
import { MarqueeBorder, ThemeSwitcher } from "@/shared/components";

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
		<>
			<MarqueeBorder />
			<div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-4 sm:p-6 overflow-auto">
				<div className="max-w-md mx-auto pt-8 sm:pt-16 pb-8 flex flex-col gap-6">
					{/* Header with mascot */}
					<div className="text-center mb-2">
						<h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							Chonk Poker
						</h1>
					</div>

					{/* Main card */}
					<div className="card bg-base-200 shadow-xl border-4 border-base-300 rounded-3xl overflow-hidden">
						{/* User greeting banner */}
						<div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-4 sm:px-6 py-4">
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold border-2 border-primary/50">
										{sessions.user.name.charAt(0).toUpperCase()}
									</div>
									<div>
										<p className="text-xs opacity-60">Welcome back!</p>
										<p className="font-bold text-sm sm:text-base">
											{sessions.user.name}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<ThemeSwitcher />
									<button
										type="button"
										className="btn btn-ghost btn-sm rounded-xl opacity-70 hover:opacity-100"
										onClick={() => signOut()}
									>
										Logout
									</button>
								</div>
							</div>
						</div>

						<div className="card-body p-4 sm:p-6">
							{/* Create Room Form */}
							<form onSubmit={handleCreateRoom}>
								<input
									hidden
									id={FormFieldsEnum.USER_NAME}
									name={FormFieldsEnum.USER_NAME}
									type="text"
									value={sessions.user.name}
									readOnly
								/>
								<input
									hidden
									id={FormFieldsEnum.USER_ID}
									name={FormFieldsEnum.USER_ID}
									type="text"
									value={sessions.user.id}
									readOnly
								/>
								<button
									type="submit"
									className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold text-base"
									disabled={createRoomMutation.isPending}
								>
									{createRoomMutation.isPending ? (
										<>
											<span className="loading loading-spinner loading-sm" />
											Creating room...
										</>
									) : (
										<>
											<span className="text-xl">+</span>
											Create New Room
										</>
									)}
								</button>
							</form>

							<div className="divider text-xs opacity-50 my-4">
								or join an existing room
							</div>

							{/* Join Room Form */}
							<form className="flex flex-col gap-3" onSubmit={handleJoinRoom}>
								<input
									hidden
									id={`join-${FormFieldsEnum.USER_NAME}`}
									name={FormFieldsEnum.USER_NAME}
									type="text"
									value={sessions.user.name}
									readOnly
								/>
								<input
									hidden
									id={`join-${FormFieldsEnum.USER_ID}`}
									name={FormFieldsEnum.USER_ID}
									type="text"
									value={sessions.user.id}
									readOnly
								/>
								<div className="relative">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50">
										#
									</div>
									<input
										id={FormFieldsEnum.ROOM_ID}
										name={FormFieldsEnum.ROOM_ID}
										type="text"
										placeholder="Enter room code"
										className="input input-lg w-full pl-10 rounded-2xl border-2 border-base-300 focus:border-secondary bg-base-100 font-mono uppercase tracking-wider text-center"
										required
									/>
								</div>
								<button
									type="submit"
									className="btn btn-secondary btn-lg w-full rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold text-base"
									disabled={joinRoomMutation.isPending}
								>
									{joinRoomMutation.isPending ? (
										<>
											<span className="loading loading-spinner loading-sm" />
											Joining...
										</>
									) : (
										"Join Room"
									)}
								</button>
							</form>
						</div>
					</div>

					{/* User rooms list */}
					<UserRoomsList />
				</div>
			</div>
		</>
	);
}
