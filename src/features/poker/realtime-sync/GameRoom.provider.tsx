import {
	createContext,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";

import type { PlanningPokerMachineSnapshot } from "@/features/poker/state-machine/planning-poker-machine";

type GameRoomContext = {
	roomId: string;
	user?: { userId: string; userName: string };
	gameState?: PlanningPokerMachineSnapshot;
};

export const GameRoomContext = createContext<GameRoomContext>({
	roomId: "",
	user: undefined,
	gameState: undefined,
});

export const GameRoomProvider = ({
	roomId,
	gameState,
	user,
	children,
}: PropsWithChildren<GameRoomContext>) => {
	const { gameState: freshGameState } = useSubscribeToPlayers({ roomId });

	return (
		<GameRoomContext.Provider
			value={{
				roomId,
				user,
				gameState: freshGameState ?? gameState,
			}}
		>
			{children}
		</GameRoomContext.Provider>
	);
};

const useSubscribeToPlayers = ({ roomId }: { roomId: string }) => {
	const [gameState, setGameState] = useState(undefined);

	useEffect(() => {
		const isLocalDev = import.meta.env.DEV;

		const host = window.location.host;

		const WEBSOCKET_ENDPOINT = `${isLocalDev ? "ws://" : "wss://"}${host}/room/ws/${roomId}`;
		console.log("WS connected: ", WEBSOCKET_ENDPOINT);

		const websocket = new WebSocket(`${WEBSOCKET_ENDPOINT}`);

		websocket.onopen = () => {
			console.log("connected");
		};

		websocket.onmessage = (event) => {
			const gameState = JSON.parse(event.data);
			console.log("🔍 gameState:", JSON.stringify(gameState));
			setGameState(gameState);
		};

		return () => {
			websocket.close();
		};
	}, [roomId]);

	return { gameState };
};
