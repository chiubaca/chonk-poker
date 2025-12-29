import { useActionState } from "react";
import { and, eq } from "drizzle-orm";
import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { nanoid } from "nanoid";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { SignIn } from "@/components/SignIn";
import { UserRoomsList } from "@/components/UserRoomsList";
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
		return <SignIn signIn={signIn} />;
	}

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="card card-border w-full max-w-md bg-base-300 mt-[30vh]">
				<div className="card-body">
					<form className="flex flex-col gap-4" action={formAction}>
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<UserIcon className="w-4 h-4 opacity-70" />
								<span>Hello, {session.user.name}</span>
							</div>

							<input
								hidden
								id={FormFieldsEnum.USER_NAME}
								name={FormFieldsEnum.USER_NAME}
								type="text"
								value={session.user.name}
							/>
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

			<div className="min-w-md">
				<UserRoomsList />
			</div>
		</div>
	);
}
