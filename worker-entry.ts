import { initDatabase } from '@/infrastructure/database/database';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers';
export { PokerRoomObject } from './src/infrastructure/durable-objects/poker-room-do'

export default createServerEntry({
  
  fetch(request) {
		initDatabase(env.CHONK_POKER_DB);
    return handler.fetch(request)
  },
})