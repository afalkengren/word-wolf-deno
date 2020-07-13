import Random from "https://deno.land/x/random/Random.js";
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { ServerRequest } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  acceptable,
  WebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "https://deno.land/std/ws/mod.ts";

import { WSMessage, WSMessageType, WSMessageDataChat, WSMessageData, WSMessageDataInit } from "../shared/ws_interfaces.ts";

const rand = new Random();
type SessionId = string;
type RoomId = string;

interface ChatMessage {
  from: string;
  body: string;
}

export class PlayerSession {
  id: SessionId;
  name: string;
  isConnected: boolean = true;
  ws: WebSocket | undefined;
  room: Room | undefined;
  constructor(sessionId: SessionId, name: string) {
    this.id = sessionId;
    this.name = name;
  }

  close() {
    if (this.ws && !this.ws.isClosed) {
      this.ws.close();
    }
    //this.room?.
  }
}

export class Room {
  id: RoomId;
  code: number;
  players = new Map<SessionId, PlayerSession>();
  messages = new Array<ChatMessage>();
  constructor(roomId: RoomId, code: number) {
    this.id = roomId;
    this.code = code;
  }

  distributeNewChat(from: string, body: string) {
    const message: ChatMessage = { from, body }; 
    const wsChatData: WSMessageDataChat = { 
      id: this.messages.push(message) - 1, 
      ...message 
    };
    this.players.forEach(session => this.sendChatToSession(session, wsChatData));
  }

  distributeChat(wsMsg: WSMessageDataChat) {
    console.log(`[WS CHAT] Distributing message in room ${this.id}`);
    const message: ChatMessage = { from: wsMsg.from, body: wsMsg.body }; 
    wsMsg.id = this.messages.push(message);
    this.players.forEach(session => this.sendChatToSession(session, wsMsg));
  }

  private sendChatToSession(session: PlayerSession, wsChatData: WSMessageDataChat) {
    console.log(`[WS CHAT] Forwarding to ${session.id}`);
    const wsMsg: WSMessage = { type: WSMessageType.chat, data: wsChatData };
    session.ws?.send(JSON.stringify(wsMsg));
  }
} 

export class SessionHandler {
  static getInstance(): SessionHandler {
    return this.singleton;
  }

  /**
   * Checks if a particular room exists 
   * @returns A boolean, false if room doesn't exist
   */
  roomIdExists(roomId: RoomId): boolean {
    return this.roomIds.has(roomId);
  }

  /**
   * Checks if a particular room exists 
   * @returns A boolean, false if room doesn't exist
   */
  roomCodeExists(roomCode: number): boolean {
    return this.roomCodes.has(roomCode);
  }
  
  /**
   * Return a room with id if exists 
   * @returns A room object
   */
  getRoomById(roomId: RoomId): Room | undefined {
    return this.roomIds.get(roomId as string);
  }

  /**
   * Return a room with code if exists 
   * @returns A room object
   */
  getRoomByCode(code: number): Room | undefined {
    return this.roomCodes.get(code as number);
  }

  /**
   * Attempts to join a particular room 
   * @returns A boolean, false if room doesn't exist
   */
  // joinRoom(roomId: string): boolean {
  //   if (!this.roomIdExists(roomId)) return false;
  //   return true;
  // }

  createNewRoom(): Room {
    const id = this.generateRoomID();
    const code = this.generateRoomCode();
    const room = new Room(id, code);
    this.roomIds.set(id, room);
    this.roomCodes.set(code, room);
    console.log(`[ROOM] Created ${id} [${code}]`)
    return room;
  }

  /**
   * Checks if a particular session exists 
   * @returns A boolean, false if session doesn't exist
   */
  sessionExists(sessionId: SessionId | undefined): boolean {
    return sessionId ? this.sessions.has(sessionId) : false;
  }

    /**
   * Get a particular session 
   * @returns A PlayerSession object, undefined if session doesn't exist
   */
  getSession(sessionId: SessionId | undefined): PlayerSession | undefined {
    return sessionId ? this.sessions.get(sessionId) : undefined; 
  }

  createNewSession(name: string): PlayerSession {
    const sessionId = this.generateSessionID();
    const newSession = new PlayerSession(sessionId, name);
    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  async connectWebSocketToSession(req: ServerRequest, sessionId: string) {
    if (!acceptable(req)) return req.respond({ status: 400 });
    const ws = await acceptWebSocket({
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers,
    });
    // Check for session after completing websocket to increase
    // chance session is still valid... 
    const session = this.getSession(sessionId);
    if (!session) return req.respond({ status: 404 });
    if (session.ws && !session.ws.isClosed) {
      session.ws.close();
    }
    session.ws = ws;
    this.wsHandler(session);
  }
  
  async wsHandler(session: PlayerSession): Promise<void> {
    console.log(`[WS CONNECTED] (${session.id})`);

    // Send INIT message to client
    const wsInitMsg: WSMessage = { 
      type: WSMessageType.init, 
      data: { 
        name: session.name,
        roomCode: session.room?.code,
      } 
    };
    await session.ws?.send(JSON.stringify(wsInitMsg));

    // Start loop
    try {
      for await (const ev of session.ws!) {
        if (!session.room) {
          console.log(`[WS CLOSE] Game ended. Terminating ${session.id}`);
          session.ws?.close();
        }
        if (typeof ev === "string") {
          const wsMsg = JSON.parse(ev) as WSMessage;
          switch (wsMsg.type) {
            case WSMessageType.init:
              console.log(`[WS INIT] (${session.id})`);
              break;
            case WSMessageType.connect:
              console.log(`[WS CONN] (${session.id})`);
              break;
            case WSMessageType.chat:
              const wsMsgData = wsMsg.data as WSMessageDataChat;
              console.log(`[WS CHAT] (${session.id}) ${wsMsgData.from}: ${wsMsgData.body}`);
              session.room?.distributeChat(wsMsgData);
              break;
            default:
              console.log(`[WS UNKNOWN!] (${session.id}) `, wsMsg);
              break;
          }
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          console.log("[WS CLOSE]", code, reason);
        }
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);
  
      if (!session.ws?.isClosed) {
        await session.ws?.close(1000).catch(console.error);
      }
    }
  }

  private generateSessionID(): SessionId {
    let uuid: SessionId;
    do {
      uuid = v4.generate();
    } while (this.sessions.has(uuid));
    return uuid;
  }

  private generateRoomID(): RoomId {
    let roomId: RoomId;
    do {
      roomId = v4.generate();
    } while (this.roomIds.has(roomId));
    return roomId;
  }

  private generateRoomCode(): number {
    let code: number;
    do {
      code = rand.int(0, 999999);
    } while (this.roomCodes.has(code));
    return code;
  }

  private constructor(){}
  private roomIds = new Map<RoomId, Room>();
  private roomCodes = new Map<number, Room>();
  private sessions = new Map<SessionId, PlayerSession>();
  
  private static singleton = new SessionHandler();
}
