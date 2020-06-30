import { listenAndServe, ServerRequest } from "https://deno.land/std/http/server.ts";
import { fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { readFormData, readJoinForm } from "./request_handler.ts"
import { SessionHandler } from "./session_handler.ts";

const pageMap = new Map([
  ["/", "./htmlsrc/index.html"], 
  ["/create?", "./htmlsrc/create.html"], 
  ["/join?", "./htmlsrc/join.html"],
  ["/out/client_main.js", "./htmlsrc/out/client_main.js"],
]);

const sessionHandler = SessionHandler.getInstance();

function resolvePage(url: string): URL {
  console.log(`resolving ${url}`);
  let u = pageMap.get(url);
  if(!u) u = "./htmlsrc/index.html";
  return new URL(u, import.meta.url); 
}

async function handlePOST(req: ServerRequest) {
  switch(req.url) {
    case "/join":
      const joinDetails = await readJoinForm(req);
      const u = new URL("./htmlsrc/join.html", import.meta.url);
      const file = await Deno.open(fromFileUrl(u));
      req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "text/html",
        }),
        body: file,
      });
    default:
      break;
  }
}

async function handleGET(req: ServerRequest) {
  if (req.url === "/ws") {
    return sessionHandler.establishWebSocket(req);
  }

  if (req.url === "/favicon.ico") {
    return req.respond({
      status: 302,
      headers: new Headers({
        location: "https://deno.land/favicon.ico",
      }),
    });
  }

  let u = resolvePage(req.url);
  console.log(`${req.url} => resolved to ${u}`);
  const file = await Deno.open(fromFileUrl(u));
  req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/html",
    }),
    body: file,
  });
}

listenAndServe({ port: 8080 }, async (req) => {
  console.log(`Got ${req.method} request with URL: ${req.url}`);
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

console.log("Initialising server on :8080....");
