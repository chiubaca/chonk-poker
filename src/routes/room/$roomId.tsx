import { useContext } from "react";
import z from "zod";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { RoomGameState } from "@/components/room-game-state/RoomGameState";
import { authClient } from "@/features/auth/hooks/auth-client";
import {
	GameRoomContext,
	GameRoomProvider,
} from "@/features/poker/realtime-sync/GameRoom.provider";

import type { PokerPlayer } from "@/features/poker/state-machine/planning-poker-machine.types";

const getGameStateServerFn = createServerFn()
	.inputValidator(z.object({ roomId: z.string() }))
	.handler(async ({ data }) => {
		const { roomId } = data;

		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
		const gameState = await stub.getGameState();

		return gameState;
	});

export const Route = createFileRoute("/room/$roomId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const gameState = await getGameStateServerFn({
			data: { roomId: params.roomId },
		});

		return {
			gameState: gameState ? JSON.parse(gameState) : null,
		};
	},
});

function RouteComponent() {
	const { roomId } = Route.useParams();
	const { gameState } = Route.useLoaderData();

	const { data: session } = authClient.useSession();

	const user = session
		? { userId: session.user.id, userName: session.user.name }
		: undefined;

	return (
		<GameRoomProvider roomId={roomId} user={user} gameState={gameState}>
			<GameRoomContent />
		</GameRoomProvider>
	);
}

function GameRoomContent() {
	const { roomId, gameState, user } = useContext(GameRoomContext);

	if (!gameState) {
		return "loading...";
	}

	return (
		<div className="min-h-screen bg-base-300 p-4 md:p-8">
			{/* Header */}
			<div className="navbar bg-base-100 rounded-box shadow-lg mb-8">
				<div className="flex-1">
					<a href="/" className="btn btn-ghost text-xl">
						Chonk Poker 🎲
					</a>
				</div>
				<div className="flex-none gap-4">
					<div className="badge badge-neutral">Room: {roomId}</div>
					<div className="badge badge-primary">
						👤 {user?.userName || "Spectating"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Main Game Area */}
				<div className="lg:col-span-3 space-y-8">
					<RoomGameState />
				</div>

				{/* Sidebar - Players List */}
				<div className="lg:col-span-1">
					<div className="card bg-base-100 shadow-xl h-full">
						<div className="card-body">
							<h3 className="card-title text-lg mb-4">
								Players ({gameState.context.players.length})
							</h3>
							<div className="space-y-2">
								{gameState.context.players.length === 0 && (
									<div className="text-base-content/50 italic text-sm">
										Waiting for players...
									</div>
								)}
								{gameState.context.players.map((player: PokerPlayer) => (
									<div
										key={player.id}
										className="flex items-center justify-between p-2 bg-base-200 rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div className="avatar placeholder">
												<div className="bg-neutral text-neutral-content rounded-full w-8">
													<span className="text-xs">
														{player.name.charAt(0).toUpperCase()}
													</span>
												</div>
											</div>
											<span className="font-medium">{player.name}</span>
										</div>
										{gameState.value !== "revealed" && (
											<div
												className={`badge ${
													player.state === "locked-in"
														? "badge-success"
														: "badge-ghost"
												}`}
											>
												{player.state === "locked-in" ? "Ready" : "Thinking"}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
