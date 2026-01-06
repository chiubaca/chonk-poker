import { useContext } from "react";

import { GameRoomContext } from "@/features/poker/realtime-sync/GameRoom.provider";

import chonkOne from "../../assets/chonk-1.png";
import chonkTwo from "../../assets/chonk-2.png";
import chonkThree from "../../assets/chonk-3.png";
import chonkFour from "../../assets/chonk-4.png";
import chonkFive from "../../assets/chonk-5.png";
import chonkSix from "../../assets/chonk-6.png";

const chonkImages = {
	"a-fine-boi": { src: chonkOne, label: "A Fine Boi", size: 1 },
	"he-chonk": { src: chonkTwo, label: "He Chonk", size: 2 },
	"heckin-chonker": { src: chonkThree, label: "A Hecken Chonker", size: 3 },
	"hefty-chonk": { src: chonkFour, label: "H E F T Y  C H O N K", size: 5 },
	"mega-chonker": { src: chonkFive, label: "M E G A  C H O N K E R", size: 8 },
	"oh-lawd-he-comin": { src: chonkSix, label: "OH LAWD HE COMIN", size: 13 },
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

	// Find the winning choice (most votes)
	const maxVotes = Math.max(...Object.values(choicesByChonk), 0);
	const winningChoices = Object.entries(choicesByChonk)
		.filter(([_, count]) => count === maxVotes)
		.map(([choice]) => choice);

	// Check if there's consensus (everyone voted the same)
	const hasConsensus =
		winningChoices.length === 1 && maxVotes === players.length;

	return (
		<div className="card bg-base-200 border-4 border-base-300 rounded-3xl overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-4 sm:px-6 py-6 text-center">
				<h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					{hasConsensus ? "Puurfect Consensus!" : "Results Are In!"}
				</h2>
				{hasConsensus && (
					<p className="text-sm opacity-60 mt-2">
						Everyone agrees! That's rare and beautiful!
					</p>
				)}
			</div>

			<div className="card-body p-4 sm:p-6">
				<div className="space-y-4">
					{Object.entries(chonkImages).map(
						([chonkValue, { src, label, size }], index) => {
							const count = choicesByChonk[chonkValue] || 0;
							const playersWithChoice = players.filter(
								(p) => p.choice === chonkValue,
							);

							if (count === 0) return null;

							const isWinner = winningChoices.includes(chonkValue);
							const percentage = Math.round((count / players.length) * 100);

							return (
								<div
									key={chonkValue}
									className={`
									rounded-2xl overflow-hidden transition-all duration-300
									border-4 animate-pop-in
									${
										isWinner
											? "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-lg shadow-primary/20"
											: "bg-base-100 border-base-300"
									}
								`}
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<div className="p-4 sm:p-5">
										<div className="flex items-center gap-4">
											{/* Chonk image */}
											<div
												className={`relative ${isWinner ? "animate-wiggle" : ""}`}
											>
												<img
													src={src}
													alt={label}
													className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
												/>
												{isWinner && (
													<div className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center text-xs">
														<span role="img" aria-label="crown">
															{"(*)"}
														</span>
													</div>
												)}
											</div>

											{/* Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<h3
														className={`font-bold text-sm sm:text-base ${isWinner ? "text-primary" : ""}`}
													>
														{label}
													</h3>
													<div
														className={`
													badge font-bold
													${isWinner ? "badge-primary" : "badge-ghost"}
												`}
													>
														{size} pts
													</div>
												</div>

												{/* Vote bar */}
												<div className="mt-2 h-2 bg-base-300 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full transition-all duration-700 ${
															isWinner
																? "bg-gradient-to-r from-primary to-secondary"
																: "bg-base-content/30"
														}`}
														style={{ width: `${percentage}%` }}
													/>
												</div>

												<div className="flex items-center justify-between mt-1.5">
													<span className="text-xs opacity-60">
														{count} {count === 1 ? "vote" : "votes"} (
														{percentage}%)
													</span>
												</div>
											</div>
										</div>

										{/* Players who chose this */}
										{playersWithChoice.length > 0 && (
											<div className="mt-4 pt-3 border-t-2 border-base-300">
												<div className="flex flex-wrap gap-2">
													{playersWithChoice.map((player) => (
														<div
															key={player.id}
															className={`
															px-3 py-1.5 rounded-xl text-xs font-medium
															${
																isWinner
																	? "bg-primary/20 text-primary border border-primary/30"
																	: "bg-base-200 opacity-70"
															}
														`}
														>
															{player.name}
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							);
						},
					)}
				</div>

				{/* Summary */}
				<div className="mt-6 p-4 bg-base-100 rounded-2xl border-2 border-base-300 text-center">
					<div className="text-5xl sm:text-6xl mb-3">
						{hasConsensus ? "🙌🏼" : "🤔"}
					</div>
					<p className="text-sm opacity-60">
						{hasConsensus
							? "Great teamwork! Everyone estimated the same level of chonkiness."
							: winningChoices.length > 1
								? "It's a tie! You might want to discuss and re-vote."
								: "Most of the team agrees on the chonk level above, lets talk about it!"}
					</p>
				</div>
			</div>
		</div>
	);
}
