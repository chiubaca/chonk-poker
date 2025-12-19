import {
	createContext,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";
import type { PlanningPokerMachineSnapshot } from "@/state-machine/planning-poker-machine";

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

		const host = window.location.host;

		const WEBSOCKET_ENDPOINT = `${isLocalDev ? "ws://" : "wss://"}${host}/room/ws/${roomId}`;
		console.log(
			"🔍 ~ useEffect() callback ~ src/realtime-sync/GameRoom.provider.tsx:60 ~ WEBSOCKET_ENDPOINT:",
			WEBSOCKET_ENDPOINT,
		);

		const websocket = new WebSocket(`${WEBSOCKET_ENDPOINT}`);

		websocket.onopen = () => {
			console.log("connected");
		};

		websocket.onmessage = (event) => {
			const gameState = JSON.parse(event.data);
			console.log(
				"🔍 ~ useEffect() callback ~ src/realtime-sync/GameRoom.provider.tsx:68 ~ gameState:",
				JSON.stringify(gameState),
			);
			setGameState(gameState);
		};

		return () => {
			websocket.close();
		};
	}, [roomId]);

	return { gameState };
};
