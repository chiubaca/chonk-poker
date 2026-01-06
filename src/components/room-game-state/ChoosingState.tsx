import { useContext } from "react";

import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";

import { GameRoomContext } from "@/features/poker/realtime-sync/GameRoom.provider";
import { handleGameActionServerFn } from "@/features/rooms/server-functions/game-room";

import chonkOne from "../../assets/chonk-1.png";
import chonkTwo from "../../assets/chonk-2.png";
import chonkThree from "../../assets/chonk-3.png";
import chonkFour from "../../assets/chonk-4.png";
import chonkFive from "../../assets/chonk-5.png";
import chonkSix from "../../assets/chonk-6.png";

import type { Option } from "@/features/poker/state-machine/planning-poker-machine.types";

const chonkImages: {
	src: string;
	label: string;
	value: Option;
	size: number;
}[] = [
	{ src: chonkOne, label: "A Fine Boi", value: "a-fine-boi", size: 1 },
	{ src: chonkTwo, label: "He Chonk", value: "he-chonk", size: 2 },
	{
		src: chonkThree,
		label: "A Hecken Chonker",
		value: "heckin-chonker",
		size: 3,
	},
	{
		src: chonkFour,
		label: "H E F T Y  C H O N K",
		value: "hefty-chonk",
		size: 5,
	},
	{
		src: chonkFive,
		label: "M E G A  C H O N K E R",
		value: "mega-chonker",
		size: 8,
	},
	{
		src: chonkSix,
		label: "OH LAWD HE COMIN",
		value: "oh-lawd-he-comin",
		size: 13,
	},
] as const;

export function ChoosingState() {
	const { roomId, user } = useContext(GameRoomContext);
	const handleAction = useServerFn(handleGameActionServerFn);

	const form = useForm({
		defaultValues: {
			selectedChonk: "a-fine-boi" as Option,
		},
		onSubmit: async ({ value }) => {
			if (!user) {
				console.log("spectator cant do this");
				return;
			}

			await handleAction({
				data: {
					roomId,
					pokerEvent: {
						type: "player.choose",
						player: {
							id: user.userId,
							name: user.userName,
							state: "choosing",
							choice: value.selectedChonk,
						},
					},
				},
			});

			// Then lock in
			await handleAction({
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
		},
	});

	return (
		<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-4 sm:px-6 py-4 text-center">
				<h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Choose Your Chonk
				</h2>
				<p className="text-sm opacity-60 mt-1">How chunky is this task?</p>
			</div>

			<div className="card-body p-4 sm:p-6">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="selectedChonk">
						{(field) => (
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
								{chonkImages.map(({ src, label, value, size }, index) => (
									<label
										key={value}
										className={`
											group relative cursor-pointer transition-all duration-200
											rounded-2xl overflow-hidden
											border-4 bg-base-100
											hover:scale-[1.02] active:scale-[0.98]
											${
												field.state.value === value
													? "border-primary shadow-lg shadow-primary/20"
													: "border-base-300 hover:border-primary/50"
											}
										`}
										style={{
											animationDelay: `${index * 50}ms`,
										}}
									>
										<input
											type="radio"
											name={field.name}
											value={value}
											checked={field.state.value === value}
											onChange={() => field.handleChange(value)}
											className="sr-only"
										/>

										{/* Size badge */}
										<div
											className={`
											absolute top-2 right-2 w-8 h-8 rounded-xl
											flex items-center justify-center
											font-bold text-sm z-10
											${
												field.state.value === value
													? "bg-primary text-primary-content"
													: "bg-base-200 text-base-content/70"
											}
										`}
										>
											{size}
										</div>

										{/* Selection indicator */}
										{field.state.value === value && (
											<div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
												<svg
													className="w-4 h-4 text-primary-content"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													aria-hidden="true"
												>
													<title>Selected</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={3}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</div>
										)}

										<div className="p-3 sm:p-4 flex flex-col items-center">
											<div
												className={`
												relative transition-transform duration-200
												${field.state.value === value ? "scale-110" : "group-hover:scale-105"}
											`}
											>
												<img
													src={src}
													alt={label}
													className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
												/>
											</div>
											<span
												className={`
												mt-2 text-xs sm:text-sm font-bold text-center leading-tight
												${field.state.value === value ? "text-primary" : "opacity-70"}
											`}
											>
												{label}
											</span>
										</div>
									</label>
								))}
							</div>
						)}
					</form.Field>

					{/* Submit button */}
					<div className="mt-6 sm:mt-8">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<button
									type="submit"
									className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold text-base gap-2"
									disabled={!canSubmit}
								>
									{isSubmitting ? (
										<>
											<span className="loading loading-spinner loading-sm" />
											Locking in...
										</>
									) : (
										<>Lock In My Choice 🔒</>
									)}
								</button>
							)}
						</form.Subscribe>
					</div>
				</form>

				{/* Spectator message */}
				{!user && (
					<div className="mt-4 text-center p-4 bg-warning/10 rounded-2xl border-2 border-warning/30">
						<p className="text-sm text-warning font-medium">
							You're spectating this round
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
