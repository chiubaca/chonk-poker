import { produce } from "immer";
import { assign, type SnapshotFrom, setup } from "xstate";

import type {
	PokerGameContext,
	PokerGameEvents,
} from "./planning-poker-machine.types";

export type PlanningPokerMachineType = typeof planningPokerMachine;

export type PlanningPokerMachineSnapshot =
	SnapshotFrom<PlanningPokerMachineType>;

export const planningPokerMachine = setup({
	types: {
		context: {} as PokerGameContext,
		events: {} as PokerGameEvents,
	},
	guards: {
		allPlayersLockedIn: ({ context }) => {
			return (
				context.players.length > 0 &&
				context.players.every((player) => player.state === "locked-in")
			);
		},
	},
}).createMachine({
	context: {
		players: [],
		lockedInPlayers: 0,
	},
	id: "planningPoker",
	initial: "choosing",
	states: {
		choosing: {
			on: {
				"player.join": {
					actions: assign(({ context, event }) =>
						produce(context, (draft) => {
							// ensure no duplicate players
							const playersMap = new Map(draft.players.map((p) => [p.id, p]));
							playersMap.set(event.player.id, event.player);
							draft.players = Array.from(playersMap.values());
						}),
					),
				},
				"player.choose": {
					actions: assign(({ context, event }) =>
						produce(context, (draft) => {
							const player = draft.players.find(
								(p) => p.id === event.player.id,
							);
							if (player) {
								player.choice = event.player.choice;
							}
						}),
					),
				},
				"player.lock": {
					actions: assign(({ context, event }) =>
						produce(context, (draft) => {
							const player = draft.players.find(
								(p) => p.id === event.player.id,
							);
							if (player?.choice) {
								player.state = "locked-in";
								draft.lockedInPlayers += 1;
							}
						}),
					),
					guard: ({ context }) => context.players.length > 0,
				},
			},
			// As soon as allPlayersLockedIn === true, we moved into the  locked state
			always: {
				target: "lockedIn",
				guard: {
					type: "allPlayersLockedIn",
				},
			},
			description: "Players are choosing a chonk size",
		},
		lockedIn: {
			on: {
				"game.reveal": {
					target: "revealed",
				},
			},
			description:
				"All players have locked in their choices. More players cannot join.",
		},
		revealed: {
			type: "final",
			description: "The selected cards from all players are revealed.",
		},
	},
});
