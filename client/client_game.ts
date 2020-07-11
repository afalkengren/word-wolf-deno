//import { WSMessage, WSMessageType, WSMessageDataChat, WSMessageData, WSMessageDataInit } from "../shared/ws_interfaces";

enum WSMessageType {
  init,
  connect,
  chat,
}

interface WSMessageData {
}

interface WSMessageDataInit extends WSMessageData {
  name: string;
}

interface WSMessageDataChat extends WSMessageData {
  id: number;
  from: string;
  body: string;
}

interface WSMessage {
  type: WSMessageType;
  data: WSMessageData;
}

let loadingText: HTMLDivElement;
let container: HTMLDivElement;
let chatFlexBox: HTMLDivElement;
let chatSendBtn: HTMLDivElement;
let chatMsgField: HTMLDivElement;

document.addEventListener('DOMContentLoaded', initOnPageLoad.bind(this))

let selfName: string = "";

// Chat Messages
class ChatMessage {
  id: number;
  from: string;
  body: string;
  isDeleted: boolean;
  element: HTMLDivElement | undefined;

  constructor(wsData: WSMessageDataChat){
    this.id = wsData.id;
    this.from = wsData.from;
    this.body = wsData.body;
    this.isDeleted = false;
    this.element = undefined;
  }
}
const chatMessages = new Map<number, ChatMessage>();

// Websocket
const ws: WebSocket = new WebSocket(`ws://${location.host}/ws`);

ws.addEventListener("message", handleWebSocketMessage);

function handleWebSocketMessage(e: MessageEvent) {
  const msg: WSMessage = JSON.parse(e.data);
  switch (msg.type) {
    case WSMessageType.init:
      console.log("[WS INIT]:", e.data);
      selfName = (msg.data as WSMessageDataInit).name;
      loadingText.style.display = "none";
      container.style.display = "flex";
      break;
    case WSMessageType.connect:
      console.log("[WS CONN]:", e.data);
      break;  
    case WSMessageType.chat:
      console.log("[WS CHAT]:", e.data);
      const chatData = msg.data as WSMessageDataChat;
      const chatMessage = new ChatMessage(chatData);
      chatMessages.set(chatData.id, chatMessage);
      addMessage(chatMessage);
      break;
    default:
      console.log("[WS UNKNOWN!]", e.data);
  } 
}

// init events

function initOnPageLoad() {
  loadingText = document.getElementById("loading-text") as HTMLDivElement;
  container = document.getElementById("container") as HTMLDivElement;
  chatFlexBox = document.getElementById("chat-box") as HTMLDivElement;
  chatSendBtn = document.getElementById("chat-input_send") as HTMLDivElement;
  chatMsgField = document.getElementById("chat-input_textfield") as HTMLDivElement;

  chatSendBtn.addEventListener("click", sendButtonClick)
}

function sendButtonClick(this: HTMLElement, ev: MouseEvent) {
  const text = chatMsgField.innerText;
  chatMsgField.innerText = "";
  sendMessage(text);
}

// functions
function sendMessage(body: string) {
  const msgData: WSMessageDataChat = { id: WSMessageType.chat, from: selfName, body: body};
  const msg: WSMessage = { type: WSMessageType.chat, data: msgData };
  ws.send(JSON.stringify(msg));
}

function addMessage(msg: ChatMessage) {
  msg.element = addMessageToDOM(String(msg.id), msg.body);
}

function addMessageToDOM(id: string, msg: string): HTMLDivElement {
  let msgDiv = document.createElement("div") as HTMLDivElement;
  msgDiv.setAttribute("id", id);
  chatFlexBox.appendChild(msgDiv);
  return msgDiv;
}