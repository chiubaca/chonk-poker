import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/room/ws/$roomId")({
	server: {
		handlers: {
			GET: async ({ request, params, context }) => {
				const roomId = params.roomId;
				if (!roomId) {
					return new Response("no room id found", { status: 404 });
				}

				const upgradeHeader = request.headers.get("Upgrade");
				if (!upgradeHeader || upgradeHeader !== "websocket") {
					return new Response("Expected Upgrade: websocket", { status: 426 });
				}

				const doId = env.POKER_ROOM_DURABLE_OBJECT.idFromName(roomId);
				const stub = env.POKER_ROOM_DURABLE_OBJECT.get(doId);
				return await stub.fetch(request);
			},
		},
	},
});
