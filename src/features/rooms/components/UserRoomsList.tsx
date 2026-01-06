import { ArrowRight } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/features/auth/hooks/auth-client";
import { getUserRoomsServerFn } from "@/features/rooms/server-functions/user-rooms";

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
			<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
				<div className="card-body p-4 sm:p-6">
					<div className="flex items-center justify-center gap-3 py-4">
						<span className="loading loading-dots loading-md text-primary" />
						<span className="text-sm opacity-60">Loading your rooms...</span>
					</div>
				</div>
			</div>
		);
	}

	if (userRooms.length === 0) {
		return (
			<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
				<div className="card-body p-4 sm:p-6">
					<div className="text-center py-6">
						<div className="text-4xl mb-3 opacity-50">🙀</div>
						<p className="text-sm opacity-60">No rooms yet!</p>
						<p className="text-xs opacity-40 mt-1">
							Create or join a room to get started
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
			<div className="card-body p-4 sm:p-6">
				<div className="flex items-center gap-2 mb-3">
					<h3 className="font-bold text-base">Your Rooms</h3>
					<div className="badge badge-primary badge-sm">{userRooms.length}</div>
				</div>
				<div
					className="space-y-2 max-h-52 overflow-y-auto pr-1"
					style={{
						maskImage:
							"linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
					}}
				>
					{userRooms
						.map((room: UserRoom) => (
							<Link
								key={room.roomId}
								to="/room/$roomId"
								params={{ roomId: room.roomId }}
								className="group flex items-center justify-between p-3 bg-base-100 rounded-2xl hover:bg-primary/10 border-2 border-transparent hover:border-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-mono font-bold text-sm border-2 border-base-300">
										#
									</div>
									<div>
										<div className="font-mono font-bold tracking-wider text-sm">
											{room.roomId}
										</div>
										<div className="flex items-center gap-1.5">
											<span
												className={`w-2 h-2 rounded-full ${
													room.status === "live"
														? "bg-success animate-pulse"
														: "bg-base-content/30"
												}`}
											/>
											<span className="text-xs opacity-60 capitalize">
												{room.status}
											</span>
										</div>
									</div>
								</div>
								<div className="btn btn-ghost btn-sm btn-circle opacity-50 group-hover:opacity-100 group-hover:bg-primary/20 transition-all">
									<ArrowRight className="w-4 h-4" />
								</div>
							</Link>
						))
						.reverse()}
				</div>
			</div>
		</div>
	);
};
