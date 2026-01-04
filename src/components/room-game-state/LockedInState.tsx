import { useContext } from "react";
import { useServerFn } from "@tanstack/react-start";

import { GameRoomContext } from "@/features/poker/realtime-sync/GameRoom.provider";
import { handleGameActionServerFn } from "@/features/rooms/server-functions/game-room";

export function LockedInState() {
	const { roomId, user } = useContext(GameRoomContext);
	const handleAction = useServerFn(handleGameActionServerFn);

	const handleRevealCards = async () => {
		if (!user) {
			console.log("spectator cant do this");
			return;
		}

		await handleAction({
			data: {
				roomId,
				pokerEvent: {
					type: "game.reveal",
					player: {
						id: user.userId,
						name: user.userName,
						state: "locked-in",
					},
				},
			},
		});
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body items-center text-center py-16">
				<div className="text-6xl mb-4">🔒</div>
				<h2 className="card-title text-3xl mb-2">All Locked In!</h2>
				<p className="text-base-content/70 mb-6">
					Waiting for cards to be revealed...
				</p>
				<button
					type="button"
					className="btn btn-primary"
					onClick={handleRevealCards}
				>
					Reveal Cards
				</button>
			</div>
		</div>
	);
}
