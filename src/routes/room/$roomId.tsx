import { useContext } from "react";
import z from "zod";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { RoomGameState } from "@/components/room-game-state/RoomGameState";
import { authClient } from "@/features/auth/hooks/auth-client";
import {
	GameRoomContext,
	GameRoomProvider,
} from "@/features/poker/realtime-sync/GameRoom.provider";
import { handleGameActionServerFn } from "@/features/rooms/server-functions/game-room";
import { ThemeSwitcher } from "@/shared/components";

import type { PokerPlayer } from "@/features/poker";

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
		try {
			const gameState = await getGameStateServerFn({
				data: { roomId: params.roomId },
			});

			return {
				gameState: gameState ? JSON.parse(gameState) : null,
			};
		} catch (error) {
			console.error("error fetching game state for room:", error);
			return { gameState: null };
		}
	},
});

function RouteComponent() {
	const { roomId } = Route.useParams();
	const { gameState } = Route.useLoaderData();

	const { data: session } = authClient.useSession();

	const user = session
		? { userId: session.user.id, userName: session.user.name }
		: undefined;

	if (!gameState) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 flex items-center justify-center">
				<div className="text-center">
					<p className="mt-4 opacity-60">sorry, something borked 😅</p>
					<a href="/" className="btn btn-ghost btn-sm mt-4">
						back to home
					</a>
				</div>
			</div>
		);
	}

	return (
		<GameRoomProvider roomId={roomId} user={user} gameState={gameState}>
			<GameRoomContent />
		</GameRoomProvider>
	);
}

function GameRoomContent() {
	const { roomId, gameState, user } = useContext(GameRoomContext);
	const handleAction = useServerFn(handleGameActionServerFn);

	if (!gameState) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 flex items-center justify-center">
				<div className="text-center">
					<div className="text-5xl mb-4 animate-bounce">{"(=^.^=)"}</div>
					<span className="loading loading-dots loading-lg text-primary" />
					<p className="mt-4 opacity-60">Loading room...</p>
				</div>
			</div>
		);
	}

	const isFirstPlayer =
		user &&
		gameState.context.players.length > 0 &&
		gameState.context.players[0].id === user.userId;

	const handleResetGame = async () => {
		if (!user) {
			console.log("spectator cant do this");
			return;
		}

		await handleAction({
			data: {
				roomId,
				pokerEvent: {
					type: "game.reset",
				},
			},
		});
	};

	const lockedInCount = gameState.context.players.filter(
		(p: PokerPlayer) => p.state === "locked-in",
	).length;
	const totalPlayers = gameState.context.players.length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
			{/* Header */}
			<header className="sticky top-0 z-40 backdrop-blur-lg bg-base-100/80 border-b-4 border-base-200">
				<div className="max-w-6xl mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						{/* Logo & Home */}
						<a
							href="/"
							className="flex items-center gap-2 hover:opacity-80 transition-opacity"
						>
							<span className="font-black text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
								Chonk Poker
							</span>
						</a>

						{/* Room info - center on mobile */}
						<div className="flex items-center gap-2">
							<div className="badge badge-lg bg-base-200 border-2 border-base-300 font-mono font-bold gap-1">
								<span className="opacity-50">#</span>
								{roomId}
							</div>
						</div>

						{/* User badge */}
						<div className="flex items-center gap-2">
							<ThemeSwitcher />
							{user ? (
								<div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5 border-2 border-primary/30">
									<div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold">
										{user.userName.charAt(0).toUpperCase()}
									</div>
									<span className="font-medium text-sm hidden sm:inline">
										{user.userName}
									</span>
								</div>
							) : (
								<div className="badge badge-ghost">Spectating</div>
							)}
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-6">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Main Game Area */}
					<div className="flex-1 order-2 lg:order-1">
						<RoomGameState />
					</div>

					{/* Sidebar - Players List */}
					<div className="lg:w-72 order-1 lg:order-2">
						<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden lg:sticky lg:top-24">
							{/* Players header */}
							<div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-3">
								<div className="flex items-center justify-between">
									<h3 className="font-bold flex items-center gap-2">
										Players
										<span className="badge badge-sm badge-primary">
											{totalPlayers}
										</span>
									</h3>
									{gameState.value !== "revealed" && totalPlayers > 0 && (
										<div className="text-xs opacity-70">
											{lockedInCount}/{totalPlayers} ready
										</div>
									)}
								</div>
								{/* Progress bar */}
								{gameState.value !== "revealed" && totalPlayers > 0 && (
									<div className="mt-2 h-1.5 bg-base-300 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
											style={{
												width: `${(lockedInCount / totalPlayers) * 100}%`,
											}}
										/>
									</div>
								)}
							</div>

							<div className="p-4">
								{/* Reset button for first player */}
								{isFirstPlayer && (
									<button
										type="button"
										className="btn btn-warning btn-sm w-full rounded-xl mb-4 font-bold"
										onClick={handleResetGame}
									>
										Reset Game
									</button>
								)}

								{/* Players list */}
								<div className="space-y-2 max-h-64 lg:max-h-96 overflow-y-auto">
									{gameState.context.players.length === 0 && (
										<div className="text-center py-6">
											<div className="text-3xl mb-2 opacity-50">
												{"( o.o )"}
											</div>
											<p className="text-sm opacity-50">
												Waiting for players...
											</p>
										</div>
									)}
									{gameState.context.players.map(
										(player: PokerPlayer, index: number) => (
											<div
												key={player.id}
												className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
													player.id === user?.userId
														? "bg-primary/10 border-2 border-primary/30"
														: "bg-base-100 border-2 border-transparent"
												}`}
												style={{
													animationDelay: `${index * 50}ms`,
												}}
											>
												<div className="flex items-center gap-3">
													<div
														className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
															player.state === "locked-in"
																? "bg-gradient-to-br from-success/30 to-success/10 border-2 border-success/50"
																: "bg-base-200 border-2 border-base-300"
														}`}
													>
														{player.name.charAt(0).toUpperCase()}
													</div>
													<div>
														<span className="font-medium text-sm block">
															{player.name}
														</span>
														{player.id === user?.userId && (
															<span className="text-xs opacity-50">You</span>
														)}
													</div>
												</div>
												{gameState.value !== "revealed" && (
													<div className="flex items-center gap-1.5">
														<span
															className={`w-2 h-2 rounded-full ${
																player.state === "locked-in"
																	? "bg-success animate-pulse"
																	: "bg-warning animate-pulse"
															}`}
														/>
														<span
															className={`text-xs font-medium ${
																player.state === "locked-in"
																	? "text-success"
																	: "text-warning"
															}`}
														>
															{player.state === "locked-in"
																? "Ready"
																: "Choosing"}
														</span>
													</div>
												)}
											</div>
										),
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
