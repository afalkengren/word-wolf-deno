
let ws: WebSocket;

// const timeline = document.getElementById("timeline");
// const sendButton = document.getElementById("sendButton");
// sendButton.onclick = send;
// const closeButton =document.getElementById("closeButton");
// closeButton.onclick=close;
// const connectButton = document.getElementById("connectButton");
// connectButton.onclick=connect;
// const status = document.getElementById("status");
// const input = document.getElementById("input");
// input.addEventListener("keydown", keyDownEvent);
// function send() {
//   const msg = input.value;
//   ws.send(msg);
//   applyState({inputValue: ""});
// }
// function keyDownEvent(e) {
//   if (e.keyCode === 13) return send();
// }
// function connect() {
//   if (ws) ws.close();
//   ws = new WebSocket(`ws://${location.host}/ws`);
//   ws.addEventListener("open", () => {
//     console.log("open", ws);
//     applyState({connected: true});
//   });
//   ws.addEventListener("message", ({data}) => {
//     timeline.appendChild(messageDom(data));
//   });
//   ws.addEventListener("close", () => {
//     applyState({connect: false});
//   });
// }
// function close() {
//   ws.close();
//   applyState({connected: false});
// }
// function applyState({connected, status, inputValue}) {
//   if (inputValue != null) {
//     input.value = inputValue;
//   }
//   if(status != null) {
//     status.innerText = status;
//   }
//   if (connected != null) {
//     if (connected) {
//       sendButton.disabled = false;
//       connectButton.disabled = true;
//       closeButton.disabled= false;
//     } else {
//       sendButton.disabled= true;
//       connectButton.disabled=false;
//       closeButton.disabled=true;
//     }
//   }
// }
// connect();