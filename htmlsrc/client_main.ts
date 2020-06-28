
let ws: WebSocket;

function send() {
  ws.send("");
}

function connect() {
  if (ws) ws.close();
  ws = new WebSocket(`ws://${location.host}/ws`);
  ws.addEventListener("open", () => {
    console.log("open", ws);
  });
}

connect();