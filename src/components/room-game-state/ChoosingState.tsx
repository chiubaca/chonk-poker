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

const chonkImages: { src: string; label: string; value: Option }[] = [
	{ src: chonkOne, label: "A Fine Boi", value: "a-fine-boi" },
	{ src: chonkTwo, label: "He Chonk", value: "he-chonk" },
	{ src: chonkThree, label: "A Hecken Chonker", value: "heckin-chonker" },
	{ src: chonkFour, label: "H E F T Y C H O N K", value: "hefty-chonk" },
	{ src: chonkFive, label: "M E G A C H O N K E R", value: "mega-chonker" },
	{ src: chonkSix, label: "OH LAWD HE COMIN", value: "oh-lawd-he-comin" },
] as const;

export function ChoosingState() {
	const { roomId, user } = useContext(GameRoomContext);
	const handleAction = useServerFn(handleGameActionServerFn);

	const form = useForm({
		defaultValues: {
			selectedChonk: "a-fine-boi" as Option,
		},
		onSubmit: async ({ value }) => {
			console.log(
				"🔍 ~ ChoosingState ~ src/components/room-game-state/ChoosingState.tsx:34 ~ value:",
				value,
			);
			if (!user) {
				console.log("spectator cant do this");
				return;
			}

			// First handle the selection
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
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title justify-center mb-6 text-2xl">
					Choose your Chonk Level...
				</h2>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="selectedChonk">
						{(field) => (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{chonkImages.map(({ src, label, value }) => (
									<label
										key={value}
										className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all border-2 border-transparent has-checked:border-primary"
									>
										<div className="card-body p-4 items-center text-center">
											<input
												type="radio"
												name={field.name}
												value={value}
												checked={field.state.value === value}
												onChange={() => field.handleChange(value)}
												className="radio radio-primary hidden"
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
						)}
					</form.Field>
					<div className="card-actions justify-center mt-8">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<button
									type="submit"
									className="btn btn-primary btn-lg w-full md:w-1/2"
									disabled={!canSubmit}
								>
									{isSubmitting ? (
										<span className="loading loading-spinner"></span>
									) : (
										"Lock In Selection 🔒"
									)}
								</button>
							)}
						</form.Subscribe>
					</div>
				</form>
			</div>
		</div>
	);
}
