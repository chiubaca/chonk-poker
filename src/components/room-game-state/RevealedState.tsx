import { useContext } from "react";

import { GameRoomContext } from "@/features/poker/realtime-sync/GameRoom.provider";

import chonkOne from "../../assets/chonk-1.png";
import chonkTwo from "../../assets/chonk-2.png";
import chonkThree from "../../assets/chonk-3.png";
import chonkFour from "../../assets/chonk-4.png";
import chonkFive from "../../assets/chonk-5.png";
import chonkSix from "../../assets/chonk-6.png";

const chonkImages = {
	"a-fine-boi": { src: chonkOne, label: "A Fine Boi" },
	"he-chonk": { src: chonkTwo, label: "He Chonk" },
	"heckin-chonker": { src: chonkThree, label: "A Hecken Chonker" },
	"hefty-chonk": { src: chonkFour, label: "H E F T Y C H O N K" },
	"mega-chonker": { src: chonkFive, label: "M E G A C H O N K E R" },
	"oh-lawd-he-comin": { src: chonkSix, label: "OH LAWD HE COMIN" },
} as const;

export function RevealedState() {
	const { gameState } = useContext(GameRoomContext);

	if (!gameState?.context?.players) {
		return null;
	}

	const players = gameState.context.players;
	const choicesByChonk = players.reduce(
		(acc, player) => {
			if (player.choice) {
				acc[player.choice] = (acc[player.choice] || 0) + 1;
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<div className="text-center mb-8">
					<div className="text-6xl mb-4">👀</div>
					<h2 className="card-title text-3xl mb-2 justify-center">
						Cards Revealed!
					</h2>
				</div>

				<div className="grid gap-6">
					{Object.entries(chonkImages).map(([chonkValue, { src, label }]) => {
						const count = choicesByChonk[chonkValue] || 0;
						const playersWithChoice = players.filter(
							(p) => p.choice === chonkValue,
						);

						if (count === 0) return null;

						return (
							<div key={chonkValue} className="card bg-base-200">
								<div className="card-body p-4">
									<div className="flex items-center gap-4">
										<img
											src={src}
											alt={label}
											className="w-20 h-20 object-contain"
										/>
										<div className="flex-1">
											<h3 className="font-bold text-lg">{label}</h3>
											<div className="badge badge-primary badge-lg">
												{count} {count === 1 ? "vote" : "votes"}
											</div>
										</div>
									</div>
									{playersWithChoice.length > 0 && (
										<div className="mt-3">
											<div className="text-sm text-base-content/70 mb-2">
												Chosen by:
											</div>
											<div className="flex flex-wrap gap-2">
												{playersWithChoice.map((player) => (
													<div key={player.id} className="badge badge-outline">
														{player.name}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
