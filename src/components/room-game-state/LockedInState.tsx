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
				},
			},
		});
	};

	return (
		<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
			<div className="card-body items-center text-center py-12 sm:py-16 px-6">
				<h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
					Everyone's Ready!
				</h2>
				<p className="text-base-content/60 mb-8 text-sm sm:text-base max-w-xs">
					All players have locked in their choices. Time to reveal the chonks!
				</p>

				{user ? (
					<button
						type="button"
						className="btn btn-primary btn-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all duration-200 font-bold text-base gap-2 px-8"
						onClick={handleRevealCards}
					>
						Reveal Cards! 👀
					</button>
				) : (
					<div className="text-center p-4 bg-warning/10 rounded-2xl border-2 border-warning/30">
						<p className="text-sm text-warning font-medium">
							Waiting for Player 1 to reveal cards...
						</p>
					</div>
				)}

				{/* Fun waiting animation */}
				<div className="mt-8 flex gap-2">
					<div
						className="w-3 h-3 bg-primary rounded-full animate-bounce"
						style={{ animationDelay: "0ms" }}
					/>
					<div
						className="w-3 h-3 bg-secondary rounded-full animate-bounce"
						style={{ animationDelay: "150ms" }}
					/>
					<div
						className="w-3 h-3 bg-accent rounded-full animate-bounce"
						style={{ animationDelay: "300ms" }}
					/>
				</div>
			</div>
		</div>
	);
}
