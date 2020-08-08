//import { WSMessage, WSMessageType, WSMessageDataChat, WSMessageData, WSMessageDataInit } from "../shared/ws_interfaces";

enum WSMessageType {
  init,
  connect,
  chat,
  game,
}

interface WSMessageData {
}

interface WSMessageDataInit extends WSMessageData {
  name: string;
  roomCode: number;
}

interface WSMessageDataChat extends WSMessageData {
  id: number;
  from: string;
  body: string;
}

interface WSMessageDataGame extends WSMessageData {
  word?: string;
}

interface WSMessage {
  type: WSMessageType;
  data: WSMessageData;
}

let container: HTMLDivElement;
let chatFlexBox: HTMLDivElement;
let chatSendBtn: HTMLDivElement;
let chatMsgField: HTMLDivElement;
let roomCodeElem: HTMLSpanElement;
let loadingTextElem: HTMLElement;

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
// ws.addEventListener("error", (ev) => {
//   const errorMessage = document.createElement("span");
//   errorMessage.style.display = "block";
//   errorMessage.innerHTML = `An error occurred: ${ev}`;

// });
ws.addEventListener("message", handleWebSocketMessage);

function handleWebSocketMessage(e: MessageEvent) {
  const msg: WSMessage = JSON.parse(e.data);
  switch (msg.type) {
    case WSMessageType.init:
      console.log("[WS INIT]:", e.data);
      const initData = msg.data as WSMessageDataInit;
      selfName = initData.name;
      roomCodeElem.innerText = String(initData.roomCode);
      loadingTextElem.style.display = "none";
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
  container = document.getElementById("container")! as HTMLDivElement;
  chatFlexBox = document.getElementById("chat-box")! as HTMLDivElement;
  chatSendBtn = document.getElementById("chat-input_send")! as HTMLDivElement;
  chatMsgField = document.getElementById("chat-input_textfield")! as HTMLDivElement;
  roomCodeElem = document.getElementById("room-code")! as HTMLSpanElement;
  loadingTextElem = document.getElementById("loading-text")!;

  chatSendBtn.addEventListener("click", sendButtonClick)
}

function sendButtonClick(this: HTMLElement, _: MouseEvent) {
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
  msgDiv.setAttribute("class", "chat__message");
  msgDiv.innerText = msg;
  chatFlexBox.appendChild(msgDiv);
  return msgDiv;
}

// temp design before canvas work is finished
function showWord(id: string, msg: string): HTMLDivElement {
  let msgDiv = document.createElement("div") as HTMLDivElement;
  msgDiv.setAttribute("id", id);
  msgDiv.setAttribute("class", "chat__message");
  msgDiv.innerText = msg;
  chatFlexBox.appendChild(msgDiv);
  return msgDiv;
}