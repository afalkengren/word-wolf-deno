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

export class Player {
  uuid: string;
  ws: WebSocket;
  roomid: string | undefined = undefined;
  isConnected: boolean = true;
  room: Room | undefined;
  constructor(uuid: string, ws: WebSocket) {
    this.uuid = uuid;
    this.ws = ws;
  }
}

export class Room {
  uuid: string;
  roomCode: number;
  players = new Map<number, Player>();
  constructor(id: string, roomCode: number) {
    this.uuid = id;
    this.roomCode = roomCode;
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
  roomExists(roomId: string): boolean {
    return this.roomIds.has(roomId);
  }
  
  /**
   * Return a room with id if exists 
   * @returns A room object
   */
  getRoomById(roomId: string): Room | undefined {
    return this.roomIds.get(roomId as string);
  }

  /**
   * Return a room with code if exists 
   * @returns A room object
   */
  getRoomByCode(roomCode: number): Room | undefined {
    return this.roomCodes.get(roomCode as number);
  }

  /**
   * Attempts to join a particular room 
   * @returns A boolean, false if room doesn't exist
   */
  joinRoom(roomId: string): boolean {
    if (!this.roomExists(roomId)) return false;
    return true;
  }

  createNewRoom(): Room {
    const id = this.generateRoomID();
    const code = this.generateRoomCode();
    const room = new Room(id, code);
    this.roomIds.set(id, room);
    this.roomCodes.set(code, room);
    return room;
  }

  establishWebSocket(req: ServerRequest) {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }).then(this.wsHandler.bind(this));
    }
  }
  
  async wsHandler(ws: WebSocket): Promise<void> {
    const playerId: string = this.generatePlayerID();
    console.log(`[WS CONNECTED] (${playerId})`);
    const wsInitMsg: WSMessage = { type: WSMessageType.init, data: { name: "Player" } };
    await ws.send(JSON.stringify(wsInitMsg));
    try {
      for await (const ev of ws) {
        if (typeof ev === "string") {
          const wsMsg = JSON.parse(ev) as WSMessage;
          switch (wsMsg.type) {
            case WSMessageType.init:
              console.log(`[WS INIT] (${playerId})`);
              break;
            case WSMessageType.connect:
              console.log(`[WS CONN] (${playerId})`);
              break;
            case WSMessageType.chat:
              const wsMsgData = wsMsg.data as WSMessageDataChat;
              console.log(`[WS CHAT] (${playerId}) ${wsMsgData.from}: ${wsMsgData.body}`);
              break;
            default:
              console.log(`[WS UNKNOWN!] (${playerId}) `, wsMsg);
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
  
      if (!ws.isClosed) {
        await ws.close(1000).catch(console.error);
      }
    }
  }

  private generatePlayerID(): string {
    let uuid: string;
    do {
      uuid = v4.generate();
    } while (this.playerIds.has(uuid));
    return uuid;
  }

  private generateRoomID(): string {
    let roomId: string;
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
  private roomIds = new Map<string, Room>();
  private roomCodes = new Map<number, Room>();
  private playerIds = new Map<string, Player>();
  private static singleton = new SessionHandler();
}
