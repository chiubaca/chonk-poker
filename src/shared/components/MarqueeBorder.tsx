import { useEffect, useRef, useState } from "react";

export function MarqueeBorder() {
	const [offset, setOffset] = useState(0);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [textWidth, setTextWidth] = useState(0);
	const textRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	useEffect(() => {
		if (textRef.current) {
			setTextWidth(textRef.current.scrollWidth);
		}
	}, [dimensions]);

	useEffect(() => {
		if (textWidth === 0) return;

		const interval = setInterval(() => {
			setOffset((prev) => (prev + 0.5) % textWidth);
		}, 50);

		return () => clearInterval(interval);
	}, [textWidth]);

	const text = "• C H O N K • P O K E R ".repeat(50);

	return (
		<>
			{/* Hidden element to measure text width */}
			<div
				ref={textRef}
				className="absolute invisible -left-[9999px] text-xs font-mono whitespace-nowrap"
				style={{ color: "hsl(var(--bc) / 0.15)" }}
			>
				{text}
			</div>

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
							transform: `translateX(${offset}px)`,
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
							transform: `translateY(${offset}px) rotate(90deg)`,
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
							transform: `translateX(-${offset}px)`,
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
							transform: `translateY(-${offset}px) rotate(-90deg)`,
							transformOrigin: "center",
						}}
					>
						{text}
					</div>
				</div>
			</div>
		</>
	);
}
