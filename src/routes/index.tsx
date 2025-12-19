// /** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import { createFileRoute } from "@tanstack/react-router";
import { Hash as HashIcon, User as UserIcon } from "lucide-react";
import { useActionState } from "react";

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
	error?: string;
	success?: string;
};

async function formActionHandler(
	prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const username = formData.get(FormFieldsEnum.USER_NAME) as string;
	const roomId = formData.get(FormFieldsEnum.ROOM_ID) as string;
	const actionType = formData.get(FormFieldsEnum.ACTION_TYPE) as string;
	console.log("🔍 ~ formActionHandler ~ src/routes/index.tsx:26 ~ username:", {
		username,
		roomId,
		actionType,
	});

	if (!username?.trim()) {
		return { ...prevState, error: "Username is required" };
	}

	if (actionType === "create") {
		// TODO: Create new room logic
		console.log("Creating new room with username:", username);
		return {
			username,
			roomId: "",
			success: "Room created successfully!",
		};
	}

	if (actionType === "join") {
		if (!roomId?.trim()) {
			return { ...prevState, error: "Room ID is required" };
		}

		// TODO: Join existing room logic
		console.log("Joining room:", roomId, "with username:", username);
		return {
			username,
			roomId,
			success: `Joined room ${roomId} successfully!`,
		};
	}

	return { ...prevState, error: "Invalid action" };
}

function RouteComponent() {
	const [formState, formAction, isPending] = useActionState(formActionHandler, {
		username: "",
		roomId: "",
	});

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
									pattern="[A-Za-z][A-Za-z0-9\-]*"
									minLength={3}
									maxLength={30}
									title="Only letters, numbers or dash"
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
