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
		<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
			<div className="card-body items-center text-center py-12 sm:py-16 px-6">
				{/* Animated cat waiting */}
				<div className="relative mb-6">
					<div className="text-6xl sm:text-7xl animate-bounce">{"(=^.^=)"}</div>
					{/* Floating cards around the cat */}
					<div className="absolute -top-2 -left-4 w-8 h-12 bg-primary/20 rounded-lg rotate-[-15deg] animate-float border-2 border-primary/30" />
					<div
						className="absolute -top-4 -right-4 w-8 h-12 bg-secondary/20 rounded-lg rotate-[10deg] animate-float border-2 border-secondary/30"
						style={{ animationDelay: "0.5s" }}
					/>
					<div
						className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-12 bg-accent/20 rounded-lg rotate-[5deg] animate-float border-2 border-accent/30"
						style={{ animationDelay: "1s" }}
					/>
				</div>

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
						<span className="text-xl">{"(o.o)"}</span>
						Reveal All Cards!
					</button>
				) : (
					<div className="text-center p-4 bg-warning/10 rounded-2xl border-2 border-warning/30">
						<p className="text-sm text-warning font-medium">
							Waiting for a player to reveal cards...
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
