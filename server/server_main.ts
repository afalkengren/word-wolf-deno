import { listenAndServe, ServerRequest, Response } from "https://deno.land/std/http/server.ts";
import { fromFileUrl, extname } from "https://deno.land/std/path/mod.ts";
import * as RequestHandler from "./request_handler.ts"
import { SessionHandler, Room } from "./session_handler.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const SERV_PORT = 8080;

// name -> filepath
interface FileInfo {
  path: string;
  size: number;
  contentType: string;
}
const resFiles = new Map<string, FileInfo>();
const contentTypes = new Map<string, string>([
  [".html", "text/html"],
  [".json", "application/json"],
  [".map",  "application/json"],
  [".txt",  "text/plain"],
  [".js",   "application/javascript"],
  [".css",  "text/css"],
  [".ico", "image/vnd.microsoft.icon"],
  [".ts", "application/javascript"],
]);

const sessionHandler = SessionHandler.getInstance();

async function loadFilesInDir(baseUrl: string) {
  for await (const filePath of walk(baseUrl)) {
    if (!filePath.isFile) continue;
    const fUrl = fromFileUrl(new URL("../" + filePath.path, import.meta.url));
    let duplicateFlag = false;
    for (const [_, fInfo] of resFiles) {
      if (fInfo.path == fUrl) {
        duplicateFlag = true;
        break;
      }
    }
    if (duplicateFlag) continue;
    const ext = extname(filePath.path);
    const type: string = contentTypes.has(ext) ? contentTypes.get(ext)! : "";
    const stat = await Deno.stat(fUrl);
    const fInfo: FileInfo = { 
      path: fUrl, 
      contentType: type,
      size: stat.size,
    };
    let key: string = filePath.path.substr(baseUrl.length);
    resFiles.set(key, fInfo);
  }
}

async function createServeFileResponse(
  req: ServerRequest, 
  status: number, 
  fileKey: string,
): Promise<Response> {
  if (!resFiles.has(fileKey)) {
    console.log(`${fileKey} not found!`);
    return { status: 404 } as Response;
  }
  const fInfo = resFiles.get(fileKey)!;
  const body = await Deno.open(fInfo.path);
  req.done.then(() => { body.close() });
  const headers = new Headers();
  headers.set("content-type", fInfo.contentType);
  headers.set("content-size", String(fInfo.size));
  return { status, headers, body };
}

// helper function
async function serveFile(
  req: ServerRequest, 
  status: number, 
  fileKey: string,
): Promise<void> {
  const res = await createServeFileResponse(req, status, fileKey);
  return req.respond(res);
}

async function handleForm(req: ServerRequest) {
  const formDetail = await RequestHandler.readLobbyForm(req);
  let room: Room;

  if (req.url == "/join") {
    console.log(`[JOIN] Attempt to join room ${formDetail.roomCode}`)
    if (!formDetail.roomCode || !sessionHandler.roomCodeExists(formDetail.roomCode)) {
      return serveFile(req, 404, "/invalid_room.html"); // TODO something
    }
    room = sessionHandler.getRoomByCode(formDetail.roomCode)!;
  } else { // url == "/create"
    room = sessionHandler.createNewRoom();
  }

  const session = sessionHandler.createNewSession(formDetail.name);
  session.room = room;
  room.players.set(session.id, session);
  const res = await createServeFileResponse(req, 200, "/game.html");
  RequestHandler.setSessionCookie(res, session.id);
  req.respond(res);
}

async function handleGET(req: ServerRequest) {
  // Remove starting '/' and then split to find base dir of request
  const urlComp = req.url.substr(1).split("/", 1);
  if (urlComp.length < 1) return;
  console.log(urlComp);
  switch(urlComp[0]) {
    case "":
      return serveFile(req, 200, "/index.html");
    case "favicon.ico":
      return serveFile(req, 302, "/media/favicon.ico");
    case "ws":
      const sessionId = RequestHandler.getSessionCookie(req);
      if (sessionId) {
        return sessionHandler.connectWebSocketToSession(req, sessionId);
      } else {
        return req.respond({ status: 403 });
      }
    case "scripts":
    case "styles":
      return serveFile(req, 200, req.url);  
    default:
      return serveFile(req, 200, req.url);
  }
}

listenAndServe({ port: SERV_PORT }, async (req) => {
  console.log(`${req.method}: ${req.url}`);
  switch(req.method) {
    case "GET":
      await handleGET(req);
      break;
    case "POST":
      // this should be the case 100% of the time
      await handleForm(req);
      break;
    default:
      break;
  }
});

console.log("Initialising server on :", SERV_PORT);
await loadFilesInDir("client/html");
await loadFilesInDir("client/scripts");
await loadFilesInDir("client");
console.log(resFiles);