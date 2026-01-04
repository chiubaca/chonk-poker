import { useEffect, useState } from "react";

export function MarqueeBorder() {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setOffset((prev) => (prev + 0.2) % 100);
		}, 50);

		return () => clearInterval(interval);
	}, []);

	const text = "• C H O N K • P O K E R ".repeat(20);

	return (
		<div className="m-2 fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-50">
			{/* Top border */}
			<div
				className="absolute top-0 left-3 right-3 h-2 flex items-center justify-center overflow-hidden"
				style={{
					color: "hsl(var(--bc) / 0.15)",
					WebkitMask:
						"linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
					mask: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
				}}
			>
				<div
					className="absolute text-xs font-mono whitespace-nowrap"
					style={{
						transform: `translateX(${offset * 2}px)`,
					}}
				>
					{text}
				</div>
			</div>

			{/* Right border */}
			<div
				className="absolute top-0 right-0 bottom-0 w-2 flex items-center justify-center overflow-hidden"
				style={{
					color: "hsl(var(--bc) / 0.15)",
					WebkitMask:
						"linear-gradient(0deg, transparent 0%, black 10%, black 90%, transparent 100%)",
					mask: "linear-gradient(0deg, transparent 0%, black 10%, black 90%, transparent 100%)",
				}}
			>
				<div
					className="absolute text-xs font-mono whitespace-nowrap"
					style={{
						transform: `translateY(${offset * 2}px) rotate(90deg)`,
						transformOrigin: "center",
					}}
				>
					{text}
				</div>
			</div>

			{/* Bottom border */}
			<div
				className="absolute bottom-0 left-3 right-3 h-2 flex items-center justify-center overflow-hidden"
				style={{
					color: "hsl(var(--bc) / 0.15)",
					WebkitMask:
						"linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
					mask: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
				}}
			>
				<div
					className="absolute text-xs font-mono whitespace-nowrap"
					style={{
						transform: `translateX(${-offset * 2}px)`,
					}}
				>
					{text}
				</div>
			</div>

			{/* Left border */}
			<div
				className="absolute top-0 left-0 bottom-0 w-2 flex items-center justify-center overflow-hidden"
				style={{
					color: "hsl(var(--bc) / 0.15)",
					WebkitMask:
						"linear-gradient(0deg, transparent 0%, black 10%, black 90%, transparent 100%)",
					mask: "linear-gradient(0deg, transparent 0%, black 10%, black 90%, transparent 100%)",
				}}
			>
				<div
					className="absolute text-xs font-mono whitespace-nowrap"
					style={{
						transform: `translateY(${-offset * 2}px) rotate(-90deg)`,
						transformOrigin: "center",
					}}
				>
					{text}
				</div>
			</div>
		</div>
	);
}
