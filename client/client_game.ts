import { WSMessage, WSMessageType, WSMessageDataChat, WSMessageData, WSMessageDataInit } from "../shared/ws_interfaces"
const chatFlexBox = document.getElementById("chatbox");
const chatSendBtn = document.getElementById("message-send");
const chatMsgField = document.getElementById("message-box");

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
  console.log("[WS]: ", e.data);
  const msg: WSMessage = e.data;
  switch (msg.type) {
    case WSMessageType.init:
      selfName = (msg.data as WSMessageDataInit).name;
      break;
    case WSMessageType.connect:
      break;  
    case WSMessageType.chat:
      const chatData = msg.data as WSMessageDataChat;
      const chatMessage = new ChatMessage(chatData);
      chatMessages.set(chatData.id, chatMessage);
      addMessage(chatMessage);
      break;
  } 
}

// init events
chatSendBtn.addEventListener("click", sendButtonClick)

function sendButtonClick(this: HTMLElement, ev: MouseEvent) {
  const text = chatMsgField.innerText;
  chatMsgField.innerText = "";
  sendMessage(text);
}

// functions
function sendMessage(body: string) {
  const msg: WSMessageDataChat = { id: -1, from: selfName, body: body};
  ws.send(JSON.stringify(msg));
}

function addMessage(msg: ChatMessage) {
  let msgDiv = document.createElement("div");
  msgDiv.setAttribute("id", String(msg.id));
  msg.element = msgDiv as HTMLDivElement;
  chatFlexBox.appendChild(msgDiv);
}