export enum WSMessageType {
  init,
  connect,
  chat,
}

export interface WSMessageData {
}

export interface WSMessageDataInit extends WSMessageData {
  name: string;
  roomCode: number;
}

export interface WSMessageDataConn extends WSMessageData {
  roomCode: number;
}

export interface WSMessageDataChat extends WSMessageData {
  id: number;
  from: string;
  body: string;
}

export interface WSMessage {
  type: WSMessageType;
  data: WSMessageData;
}

