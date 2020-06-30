import { listenAndServe, ServerRequest } from "https://deno.land/std/http/server.ts";
import { fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { readFormData, readJoinForm } from "./request_handler.ts"
import { SessionHandler } from "./session_handler.ts";

const pageMap = new Map([
  ["/", "./htmlsrc/index.html"], 
  ["/out/client_main.js", "./htmlsrc/out/client_main.js"],
]);

const htmlDirURL = new URL("../client/html/", import.meta.url);

const pageIndexFile = await Deno.open(fromFileUrl(new URL("index.html", htmlDirURL)));
const pageJoinFile = await Deno.open(fromFileUrl(new URL("join.html", htmlDirURL)));
const pageCreateFile = await Deno.open(fromFileUrl(new URL("create.html", htmlDirURL)));
const mediaFavIcoFile = await Deno.open(fromFileUrl(new URL("media/favicon.ico", htmlDirURL)));
const jsClientMainFile = await Deno.open(fromFileUrl(new URL("scripts/client_main.js", htmlDirURL)));

const sessionHandler = SessionHandler.getInstance();

function respondToRequest(
  req: ServerRequest, 
  status: number, 
  body: any, 
  contentType: string = "text/html"
): Promise<void> {
  return req.respond({
    status: status,
    headers: new Headers({ "content-type": contentType }),
    body: body,
  });
}

async function handlePOST(req: ServerRequest) {
  switch(req.url) {
    case "/join":
      const joinDetails = await readJoinForm(req);
      return respondToRequest(req, 200, pageJoinFile);
    default:
      break;
  }
}

async function handleGET(req: ServerRequest) {
  switch(req.url) {
    case "/ws":
      return sessionHandler.establishWebSocket(req);
    case "/favicon.ico":
      return respondToRequest(req, 302, mediaFavIcoFile, "image/vnd.microsoft.icon");
    case "/":
      return respondToRequest(req, 200, pageIndexFile);
    case "/main.js":
      return respondToRequest(req, 200, jsClientMainFile, "text/javascript");
    default:
      return;
  }
}

listenAndServe({ port: 8080 }, async (req) => {
  console.log(`${req.method}: ${req.url}`);
  switch(req.method) {
    case "GET":
      await handleGET(req);
      break;
    case "POST":
      await handlePOST(req);
      break;
    default:
      break;
  }
});

console.log("Initialising server on :8080");
