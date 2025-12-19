// /** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import { createFileRoute } from "@tanstack/react-router";
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
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
				<h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
					Chonk Poker
				</h1>

				<form className="space-y-6" action={formAction}>
					{/* Username Input */}
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Username
						</label>
						<input
							id={FormFieldsEnum.USER_NAME}
							type="text"
							placeholder="Enter your username"
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					{/* Create Room */}
					<button
						type="submit"
						name={FormFieldsEnum.ACTION_TYPE}
						value="create"
						className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
					>
						Create new room
					</button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">OR</span>
						</div>
					</div>

					{/* Join Existing Room */}
					<div>
						<label
							htmlFor="roomId"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Room ID
						</label>
						<input
							id={FormFieldsEnum.ROOM_ID}
							type="text"
							placeholder="Enter room ID"
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
					<button
						type="submit"
						name={FormFieldsEnum.ACTION_TYPE}
						value="join"
						className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
					>
						Join Existing Room
					</button>
				</form>
			</div>
		</div>
	);
}
