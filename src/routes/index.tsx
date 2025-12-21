// /** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */

import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { useActionState } from "react";

import {
	createFileRoute,
	redirect,
	useLoaderData,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import {
	createNewUserServerFn,
	getUserServerFn,
	logoutUserServerFn,
} from "@/server-functions/user";

export const Route = createFileRoute("/")({
	component: RouteComponent,
	loader: async () => {
		const user = await getUserServerFn();
		return { user };
	},
});

const FormFieldsEnum = {
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
			roomId: formData.get(FormFieldsEnum.ROOM_ID)?.toString() || "",
			actionType: formData.get(FormFieldsEnum.ACTION_TYPE)?.toString() || "",
		};
	})
	.handler(async ({ data }) => {
		const { userName: newUserName, roomId, actionType } = data;
		const loggedInUser = await getUserServerFn();

		// Helper functions
		const getOrCreateUser = async (
			newUserName: string,
			loggedInUser: { userId: string; userName: string } | null,
		) => {
			if (loggedInUser) {
				return { id: loggedInUser.userId, name: loggedInUser.userName };
			}

			const { userId: newUserId } = await createNewUserServerFn({
				data: { userName: newUserName },
			});
			return { id: newUserId, name: newUserName };
		};

		const handleCreateRoom = async (user: { id: string; name: string }) => {
			const newRoomId = "p00p"; // TODO: make this dynamic!
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

			const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
			await stub.gameAction({
				player: { ...user, state: "choosing" },
				type: "player.join",
			});
			return "p00p"; // TODO: should return the actual roomId
		};

		const user = await getOrCreateUser(newUserName, loggedInUser);

		let targetRoomId: string;

		switch (actionType) {
			case "create":
				targetRoomId = await handleCreateRoom(user);
				break;
			case "join":
				targetRoomId = await handleJoinRoom(user, roomId);
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
	const { user } = useLoaderData({ from: "/" });

	const handleForm = useServerFn(handleFormServerFn);
	const logout = useServerFn(logoutUserServerFn);

	const [_formState, formAction, isPending] = useActionState(
		(_prevState: FormState, formData: FormData) => {
			handleForm({ data: formData });
			return null;
		},
		null,
	);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="card card-border w-full max-w-md bg-accent-content">
				<div className="card-body">
					<form className="flex flex-col gap-4" action={formAction}>
						{/* Username Input or User Greeting */}
						{user ? (
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<UserIcon className="w-4 h-4 opacity-70" />
									<span>Hello, {user.userName}</span>
								</div>
								<button
									type="button"
									className="btn btn-ghost btn-xs"
									onClick={async () => await logout()}
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex flex-col ">
								<label className="input validator flex items-center w-full">
									<UserIcon className="w-4 h-4 opacity-70" />
									<input
										id={FormFieldsEnum.USER_NAME}
										name={FormFieldsEnum.USER_NAME}
										type="text"
										required
										placeholder="Username"
									/>
								</label>
							</div>
						)}

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
