import { useEffect, useState } from "react";

import chonkOne from "../../assets/chonk-1.png";
import chonkTwo from "../../assets/chonk-2.png";
import chonkThree from "../../assets/chonk-3.png";
import chonkFour from "../../assets/chonk-4.png";
import chonkFive from "../../assets/chonk-5.png";
import chonkSix from "../../assets/chonk-6.png";

interface Snowflake {
	id: number;
	x: number;
	y: number;
	size: number;
	speed: number;
	rotation: number;
	rotationSpeed: number;
	asset: string;
}

export const SnowingChonks = () => {
	const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

	useEffect(() => {
		const assets = [
			chonkOne,
			chonkTwo,
			chonkThree,
			chonkFour,
			chonkFive,
			chonkSix,
		];

		const initialSnowflakes: Snowflake[] = Array.from(
			{ length: 20 },
			(_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100 - 100,
				size: Math.random() * 30 + 25,
				speed: Math.random() * 0.2 + 0.1,
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 2,
				asset: assets[Math.floor(Math.random() * assets.length)],
			}),
		);

		setSnowflakes(initialSnowflakes);

		const interval = setInterval(() => {
			setSnowflakes((prev) =>
				prev
					.map((flake) => ({
						...flake,
						y: flake.y + flake.speed,
						rotation: flake.rotation + flake.rotationSpeed,
						x: flake.x + Math.sin(flake.y * 0.01) * 0.05,
					}))
					.map((flake) => {
						if (flake.y > 110) {
							return {
								...flake,
								y: -10,
								x: Math.random() * 100,
							};
						}
						return flake;
					}),
			);
		}, 16.67);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden">
			{snowflakes.map((flake) => (
				<div
					key={flake.id}
					className="absolute opacity-70"
					style={{
						left: `${flake.x}%`,
						top: `${flake.y}%`,
						width: `${flake.size}px`,
						height: `${flake.size}px`,
						transform: `rotate(${flake.rotation}deg)`,
						transition: "none",
					}}
				>
					<img
						src={flake.asset}
						alt="falling chonk"
						className="w-full h-full object-contain"
						draggable={false}
					/>
				</div>
			))}
		</div>
	);
};
