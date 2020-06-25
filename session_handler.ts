import { v4 } from "https://deno.land/std/uuid/mod.ts";
import {
  acceptWebSocket,
  acceptable,
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";

class Session {
  id: string;
  players = new Map<number, WebSocket>();
  constructor(id: string) {
    this.id = id;
  }
} 

export class SessionHandler {
  sessions = new Map<string, Session>();

  joinSession(id: string): boolean {
    if (!this.sessions.has(id)) return false;

  }

  createNewSession(): string {
    const uuid = this.generateSessionID();
    this.sessions.set(uuid, new Session(uuid));
    return uuid;
  }

  private generateSessionID(): string {
    let uuid: string;
    do {
      uuid = v4.generate();
    } while (this.sessions.has(uuid));
    return uuid;
  }
}

/*
if (req.url === "/ws") {
  if (acceptable(req)) {
    acceptWebSocket({
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers,
    }).then(wsHandler);
  }
  return;
}

async function wsHandler(ws: WebSocket): Promise<void> {
  const id = ++clientId;
  clients.set(id, ws);
  dispatch(`Connected: [${id}]`);
  for await (const msg of ws) {
    console.log(`msg:${id}`, msg);
    if (typeof msg === "string") {
      dispatch(`[${id}]: ${msg}`);
    } else if (isWebSocketCloseEvent(msg)) {
      clients.delete(id);
      dispatch(`Closed: [${id}]`);
      break;
    }
  }
}
*/