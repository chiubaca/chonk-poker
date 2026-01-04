import { DoorOpen, Hash } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { getUserRoomsServerFn } from "@/server-functions/user-rooms";

type UserRoom = {
	roomId: string;
	status: string | null;
};

export const UserRoomsList = () => {
	const { data: session } = authClient.useSession();

	const { data: userRooms = [], isPending } = useQuery({
		queryKey: ["user-rooms", session?.user.id],
		queryFn: () => getUserRoomsServerFn({ data: session?.user.id || "" }),
		enabled: !!session?.user.id,
	});

	if (!session) {
		return null;
	}

	if (isPending) {
		return (
			<div className="card  bg-base-300">
				<div className="card-body">
					<div className="flex items-center gap-2">
						<span className="loading loading-spinner loading-sm"></span>
						<span>Loading your rooms...</span>
					</div>
				</div>
			</div>
		);
	}

	if (userRooms.length === 0) {
		return (
			<div className="card bg-base-300">
				<div className="card-body">
					<div className="text-center opacity-70">
						<DoorOpen className="w-8 h-8 mx-auto mb-2" />
						<p>You haven't joined any rooms yet</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="card w-full max-w-md bg-base-300">
			<div className="card-body">
				<h3 className="card-title text-lg mb-4">Your Rooms</h3>
				<div className="space-y-2 max-h-64 overflow-y-auto">
					{userRooms.map((room: UserRoom) => (
						<Link
							key={room.roomId}
							to="/room/$roomId"
							params={{ roomId: room.roomId }}
							className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-100 transition-colors"
						>
							<div className="flex items-center gap-3">
								<Hash className="w-4 h-4 opacity-70" />
								<div>
									<div className="font-mono font-bold">{room.roomId}</div>
									<div className="text-xs opacity-70 capitalize">
										{room.status}
									</div>
								</div>
							</div>
							<div className="btn btn-ghost btn-xs">Enter</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};
