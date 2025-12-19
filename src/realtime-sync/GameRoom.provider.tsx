import type { PlanningPokerMachineSnapshot } from "@chonk-planning-poker/shared";
import {
	createContext,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";

type GameRoomContext = {
	roomId: string;
	currentUserId: string;
	currentUserName: string;
	gameState?: PlanningPokerMachineSnapshot;
};

export const GameRoomContext = createContext<GameRoomContext>({
	roomId: "",
	currentUserId: "",
	currentUserName: "",
	gameState: undefined,
});

export const GameRoomProvider = ({
	roomId,
	gameState,
	currentUserId,
	currentUserName,
	children,
}: PropsWithChildren<GameRoomContext>) => {
	const { gameState: freshGameState } = useSubscribeToPlayers({ roomId });

	return (
		<GameRoomContext.Provider
			value={{
				roomId,
				currentUserId,
				currentUserName,
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
		// is local dev
		const isLocalDev = import.meta.env.DEV;

		const WEBSOCKET_ENDPOINT = isLocalDev
			? "ws://localhost:8787/ws/game-state/"
			: "wss://chonk-planning-poker-backend.chiubaca.workers.dev/ws/game-state/";
		const websocket = new WebSocket(`${WEBSOCKET_ENDPOINT}${roomId}`);

		websocket.onopen = () => {
			console.log("connected");
		};

		websocket.onmessage = (event) => {
			const gameState = JSON.parse(event.data);
			setGameState(gameState);
		};

		return () => {
			websocket.close();
		};
	}, [roomId]);

	return { gameState };
};
