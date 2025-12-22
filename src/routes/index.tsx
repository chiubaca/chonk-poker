import { useActionState } from "react";
import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { nanoid } from "nanoid";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { newUsersToRoomsTable, roomTable } from "@/drizzle/schema";
import { authClient, signIn, signOut } from "@/lib/auth-client";
import { getDb } from "@/lib/database";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const FormFieldsEnum = {
	USER_ID: "userID",
	USER_NAME: "userName",
	ROOM_ID: "roomId",
	ACTION_TYPE: "actionType",
};

type FormState = {
	username: string;
	roomId: string;
} | null;

export const handleFormServerFn = createServerFn({ method: "POST" })
	.inputValidator((formData) => {
		if (!(formData instanceof FormData)) {
			throw new Error("Expected FormData");
		}

		return {
			userName: formData.get(FormFieldsEnum.USER_NAME)?.toString() || "",
			userId: formData.get(FormFieldsEnum.USER_ID)?.toString() || "",
			roomId: formData.get(FormFieldsEnum.ROOM_ID)?.toString() || "",
			actionType: formData.get(FormFieldsEnum.ACTION_TYPE)?.toString() || "",
		};
	})
	.handler(async ({ data }) => {
		const { userId, userName, roomId, actionType } = data;

		const handleCreateRoom = async (user: { id: string; name: string }) => {
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
			await db
				.insert(newUsersToRoomsTable)
				.values({ roomId: newRoomId, userId });

			const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(newRoomId);
			await stub.createRoom(user);
			return newRoomId;
		};

		const handleJoinRoom = async (
			user: { id: string; name: string },
			roomId: string,
		) => {
			if (!roomId) {
				throw new Error("No room id was provided");
			}

			const db = getDb();
			await db.insert(newUsersToRoomsTable).values({ roomId, userId });

			const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
			await stub.gameAction({
				player: { ...user, state: "choosing" },
				type: "player.join",
			});
			return roomId;
		};

		let targetRoomId: string;

		switch (actionType) {
			case "create":
				targetRoomId = await handleCreateRoom({ id: userId, name: userName });
				break;
			case "join":
				targetRoomId = await handleJoinRoom(
					{ id: userId, name: userName },
					roomId,
				);
				break;
			default:
				throw new Error(`Unknown action type: ${actionType}`);
		}

		throw redirect({
			to: "/room/$roomId",
			params: { roomId: targetRoomId },
		});
	});

function RouteComponent() {
	const handleForm = useServerFn(handleFormServerFn);

	const [_formState, formAction, isPending] = useActionState(
		(_prevState: FormState, formData: FormData) => {
			handleForm({ data: formData });
			return null;
		},
		null,
	);
	const {
		data: session,
		isPending: isAuthPending, //loading state
		// error: authError, //error object
		// refetch: refetchAuth, //refetch the session
	} = authClient.useSession();

	if (!session) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-base-100">
				<div className="card w-full max-w-md bg-base-200 shadow-xl">
					<div className="card-body items-center text-center">
						<h2 className="card-title text-2xl font-bold mb-2">
							Welcome to Chonk Poker
						</h2>
						<p className="text-base-content/70 mb-6">
							Sign in to start planning with your team
						</p>

						<button
							onClick={async () => {
								await signIn();
							}}
							type="button"
							className="btn btn-wide btn-outline hover:btn-primary transition-all duration-200 gap-3"
							disabled={isAuthPending}
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<title>Google logo</title>
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							{isAuthPending ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : (
								"Sign in with Google"
							)}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="card card-border w-full max-w-md bg-base-300">
				<div className="card-body">
					<form className="flex flex-col gap-4" action={formAction}>
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<UserIcon className="w-4 h-4 opacity-70" />
								<span>Hello, {session.user.name}</span>
							</div>

							<input
								hidden
								id={FormFieldsEnum.USER_ID}
								name={FormFieldsEnum.USER_ID}
								type="text"
								value={session.user.id}
							/>
							<button
								type="button"
								className="btn btn-ghost btn-xs "
								onClick={async () => await signOut()}
							>
								Logout
							</button>
						</div>

						{/* Create Room */}
						<button
							type="submit"
							name={FormFieldsEnum.ACTION_TYPE}
							value="create"
							className="btn btn-primary"
							disabled={isPending}
						>
							{isPending ? "Processing..." : "Create new room"}
						</button>

						<div className="divider">OR</div>
						{/* Join Existing Room */}
						<div className="flex flex-col gap-2">
							<label className="input flex items-center gap-2 w-full">
								<HashIcon className="w-4 h-4 opacity-70" />
								<input
									id={FormFieldsEnum.ROOM_ID}
									name={FormFieldsEnum.ROOM_ID}
									type="text"
									placeholder="Enter room ID"
									className="grow"
								/>
							</label>
						</div>
						<button
							type="submit"
							name={FormFieldsEnum.ACTION_TYPE}
							value="join"
							className="btn btn-secondary"
							disabled={isPending}
						>
							{isPending ? "Processing..." : "Join Existing Room"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
