export enum WSMessageType {
  init,
  connect,
  chat,
}

export interface WSMessageData {
}

export interface WSMessageDataInit extends WSMessageData {
  name: string;
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

