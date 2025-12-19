import { DurableObject } from "cloudflare:workers";
import { createActor } from "xstate";
import {
	type PlanningPokerMachineSnapshot,
	planningPokerMachine,
} from "@/state-machine/planning-poker-machine";
import type {
	PokerGameEvents,
	PokerPlayer,
} from "@/state-machine/planning-poker-machine.types";

export class PokerRoomObject extends DurableObject<Env> {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;

		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS poker_room(
     		id         INTEGER PRIMARY KEY,
				game_state TEXT
      );
		`);
	}

	async gameAction(event: PokerGameEvents) {
		console.log(
			"🔍 ~ gameAction ~ src/durable-objects/poker-room-do.ts:33 ~ event:",
			event,
		);
		const query = this.sql.exec(
			`SELECT game_state FROM poker_room WHERE id = 1`,
		);

		const record = query.one();
		if (!record) {
			throw new Error("No game state found");
		}

		const gameState = JSON.parse(
			record.game_state as string,
		) as PlanningPokerMachineSnapshot;

		const gameStateMachineActor = createActor(planningPokerMachine, {
			snapshot: gameState,
		}).start();

		gameStateMachineActor.send(event);

		const gameStateSnapshot =
			gameStateMachineActor.getPersistedSnapshot() as PlanningPokerMachineSnapshot;

		const serialisedGameState = JSON.stringify(gameStateSnapshot);
		this.sql.exec(
			`UPDATE poker_room SET game_state = ? WHERE id = 1`,
			serialisedGameState,
		);

		const sockets = this.ctx.getWebSockets();
		for (const socket of sockets) {
			socket.send(serialisedGameState);
		}
	}

	async getGameState() {
		const query = this.sql.exec(
			`SELECT game_state FROM poker_room WHERE id = 1`,
		);

		const record = query.one();
		if (!record) {
			return null;
		}

		return record.game_state as string;
	}

	async createRoom(player: Pick<PokerPlayer, "id" | "name">) {
		const machine = createActor(planningPokerMachine).start();
		machine.send({
			type: "player.join",
			player: { ...player, state: "choosing" },
		});
		const gameState = machine.getPersistedSnapshot();

		this.sql.exec(
			`INSERT OR REPLACE INTO poker_room (id, game_state) VALUES (?, ?)`,
			1,
			JSON.stringify(gameState),
		);
	}

	async fetch(_: Request) {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		this.ctx.acceptWebSocket(server);
		console.log("connected");

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketClose(
		ws: WebSocket,
		code: number,
		reason: string,
		wasClean: boolean,
	): void | Promise<void> {
		console.log("client closed");
	}
}
