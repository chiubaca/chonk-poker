import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

export { PokerRoomObject } from './src/durable-objects/poker-room-do'

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})