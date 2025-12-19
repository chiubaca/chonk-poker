// /** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { useActionState } from "react";
import { createNewUserServerFn } from "@/server-functions/user";

export const Route = createFileRoute("/")({
	component: RouteComponent,
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
		const { userName, roomId, actionType } = data;

		if (actionType === "create") {
			console.log("handle create!");

			await createNewUserServerFn({ data: { userName } });

			console.log("redirecting...");

			const newRoomId = "p00p";
			throw redirect({
				to: "/room/$roomId",
				params: { roomId: newRoomId },
			});
		}

		if (actionType === "join") {
			console.log("not impleted yet...");
		}
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

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="card card-border w-full max-w-md bg-accent-content">
				<div className="card-body">
					<form className="flex flex-col gap-4" action={formAction}>
						{/* Username Input */}
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
