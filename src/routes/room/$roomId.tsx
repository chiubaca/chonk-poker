import { useActionState, useContext } from "react";
import z from "zod";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import {
	GameRoomContext,
	GameRoomProvider,
} from "@/realtime-sync/GameRoom.provider";
import { handleGameActionServerFn } from "@/server-functions/game-room";
import { getUserServerFn } from "@/server-functions/user";

import chonkOne from "../../assets/chonk-1.png";
import chonkTwo from "../../assets/chonk-2.png";
import chonkThree from "../../assets/chonk-3.png";
import chonkFour from "../../assets/chonk-4.png";
import chonkFive from "../../assets/chonk-5.png";
import chonkSix from "../../assets/chonk-6.png";

import type { Option } from "@/state-machine/planning-poker-machine.types";

const chonkImages: { src: string; label: string; value: Option }[] = [
	{ src: chonkOne, label: "A Fine Boi", value: "a-fine-boi" },
	{ src: chonkTwo, label: "He Chonk", value: "he-chonk" },
	{ src: chonkThree, label: "A Hecken Chonker", value: "heckin-chonker" },
	{ src: chonkFour, label: "H E F T Y C H O N K", value: "hefty-chonk" },
	{ src: chonkFive, label: "M E G A C H O N K E R", value: "mega-chonker" },
	{ src: chonkSix, label: "OH LAWD HE COMIN", value: "oh-lawd-he-comin" },
] as const;

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
		const user = await getUserServerFn();
		const gameState = await getGameStateServerFn({
			data: { roomId: params.roomId },
		});

		return {
			user,
			gameState: gameState ? JSON.parse(gameState) : null,
		};
	},
});

function RouteComponent() {
	const { roomId } = Route.useParams();
	const { user, gameState } = Route.useLoaderData();

	return (
		<GameRoomProvider
			roomId={roomId}
			user={user || undefined}
			gameState={gameState}
		>
			<GameRoomContent />
		</GameRoomProvider>
	);
}

function GameRoomContent() {
	const { roomId, gameState, user } = useContext(GameRoomContext);

	const handleAction = useServerFn(handleGameActionServerFn);

	const handleLockIn = (_previousState: unknown, _formData: FormData) => {
		if (!user) {
			console.log("spectator cant do this");
			return;
		}

		handleAction({
			data: {
				roomId,
				pokerEvent: {
					type: "player.lock",
					player: {
						id: user.userId,
						name: user.userName,
						state: "locked-in",
					},
				},
			},
		});
		return { success: true };
	};

	const onChonkSelection = (
		event: React.MouseEvent<HTMLInputElement, MouseEvent>,
	) => {
		if (!user) {
			console.log("spectator cant do this");
			return;
		}

		const optionValue = (event.target as HTMLInputElement).value;

		handleAction({
			data: {
				roomId,
				pokerEvent: {
					type: "player.choose",
					player: {
						id: user.userId,
						name: user.userName,
						state: "choosing",
						choice: optionValue as Option,
					},
				},
			},
		});
	};

	const [_formState, handleLockInAction, isPending] = useActionState(
		handleLockIn,
		null,
	);

	if (!gameState) {
		return <>loading...</>;
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
					{gameState.value === "choosing" && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<h2 className="card-title justify-center mb-6 text-2xl">
									Choose your Chonk Level...
								</h2>
								<form action={handleLockInAction}>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										{chonkImages.map(({ src, label, value }) => (
											<label
												key={value}
												className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all border-2 border-transparent has-checked:border-primary"
											>
												<div className="card-body p-4 items-center text-center">
													<input
														type="radio"
														name="selectedChonk"
														value={value}
														className="radio radio-primary hidden"
														onClick={onChonkSelection}
													/>
													<img
														src={src}
														alt={label}
														className="w-32 h-32 object-contain mb-2"
													/>
													<span className="font-medium">{label}</span>
												</div>
											</label>
										))}
									</div>
									<div className="card-actions justify-center mt-8">
										<button
											type="submit"
											className="btn btn-primary btn-lg w-full md:w-1/2"
											disabled={isPending}
										>
											{isPending ? (
												<span className="loading loading-spinner"></span>
											) : (
												"Lock In Selection 🔒"
											)}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}

					{gameState.value === "lockedIn" && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body items-center text-center py-16">
								<div className="text-6xl mb-4">🔒</div>
								<h2 className="card-title text-3xl mb-2">All Locked In!</h2>
								<p className="text-base-content/70">
									Waiting for cards to be revealed...
								</p>
							</div>
						</div>
					)}

					{gameState.value === "revealed" && <>implemnet me...</>}
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
								{gameState.context.players.map((player) => (
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
										{player.choice}
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
