import { initDatabase } from '@/lib/database';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers';
export { PokerRoomObject } from './src/durable-objects/poker-room-do'

export default createServerEntry({
  
  fetch(request) {
		initDatabase(env.CHONK_POKER_DB);
    return handler.fetch(request)
  },
})