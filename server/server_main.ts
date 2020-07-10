import { listenAndServe, ServerRequest } from "https://deno.land/std/http/server.ts";
import { fromFileUrl, extname } from "https://deno.land/std/path/mod.ts";
import { readFormData, readJoinForm } from "./request_handler.ts"
import { SessionHandler } from "./session_handler.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

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
]);

const sessionHandler = SessionHandler.getInstance();

async function loadFilesInDir(baseUrl: string) {
  for await (const filePath of walk(baseUrl)) {
    if (!filePath.isFile) continue;
    const fUrl = fromFileUrl(new URL("../" + filePath.path, import.meta.url));
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

async function serveFile(
  req: ServerRequest, 
  status: number, 
  fileKey: string,
): Promise<void> {
  if (!resFiles.has(fileKey)) {
    console.log(`${fileKey} not found!`);
    return req.respond({ status: 404 });
  }
  const fInfo = resFiles.get(fileKey)!;
  const body = await Deno.open(fInfo.path);
  req.done.then(() => { body.close() });
  const headers = new Headers();
  headers.set("content-type", fInfo.contentType);
  headers.set("content-size", String(fInfo.size));
  return req.respond({ status, headers, body });
}

async function handlePOST(req: ServerRequest) {
  switch(req.url) {
    case "/join":
      //const joinDetails = await readJoinForm(req);
      return serveFile(req, 200, "/game.html");
    default:
      break;
  }
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
      return sessionHandler.establishWebSocket(req);
    case "scripts":
    case "styles":
      return serveFile(req, 200, req.url);  
    default:
      return serveFile(req, 200, req.url);
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
await loadFilesInDir("client/html");
await loadFilesInDir("client/scripts");
console.log(resFiles);