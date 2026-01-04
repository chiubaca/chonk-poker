import { useContext } from "react";

import { GameRoomContext } from "@/features/poker/realtime-sync/GameRoom.provider";

import { ChoosingState } from "./ChoosingState";
import { LockedInState } from "./LockedInState";
import { RevealedState } from "./RevealedState";

export function RoomGameState() {
	const { gameState } = useContext(GameRoomContext);

	if (!gameState) {
		return null;
	}

	switch (gameState.value) {
		case "choosing":
			return <ChoosingState />;
		case "lockedIn":
			return <LockedInState />;
		case "revealed":
			return <RevealedState />;
		default:
			return null;
	}
}
