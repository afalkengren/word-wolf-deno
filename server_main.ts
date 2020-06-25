import { listenAndServe, ServerRequest } from "https://deno.land/std/http/server.ts";
import { fromFileUrl } from "https://deno.land/std/path/mod.ts";

const pageMap = new Map([
  ["/", "./htmlsrc/index.html"], 
  ["/create", "./htmlsrc/create.html"], 
  ["/join", "./htmlsrc/join.html"]
]);

function resolvePage(url: string): URL {
  let u = pageMap.get(url);
  if(u === null || u === undefined) {
    u = "./index.html";
  }
  return new URL(u, import.meta.url);
}

async function handlePOST(req: ServerRequest) {
  switch(req.url) {
    case "/join":

      break;
    case "/create":
      break;
  }
}

async function handleGET(req: ServerRequest) {
  let u = resolvePage(req.url);
  if (u.protocol.startsWith("http")) {
    fetch(u.href).then(async (resp) => {
      const body = new Uint8Array(await resp.arrayBuffer());
      return req.respond({
        status: resp.status,
        headers: new Headers({
          "content-type": "text/html",
        }),
        body,
      });
    });
  } else {
    const file = await Deno.open(fromFileUrl(u));
    req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "text/html",
      }),
      body: file,
    });
  }
}

listenAndServe({ port: 8080 }, async (req) => {
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
