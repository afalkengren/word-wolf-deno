// let ws: WebSocket = new WebSocket(`ws://${location.host}/ws`);

// ws.addEventListener("open", (e: Event) => {
//   console.log("[WS] Opened");
// });

// ws.addEventListener("message", (e: MessageEvent) => {
//   console.log("[WS]: ", e.data);
// });

// ws.addEventListener("close", (e: CloseEvent) => {
//   if (e.wasClean) {
//     console.log(`[WS] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
//   } else {
//     // e.g. server process killed or network down
//     // event.code is usually 1006 in this case
//     console.log('[WS] Connection died');
//   }
// });