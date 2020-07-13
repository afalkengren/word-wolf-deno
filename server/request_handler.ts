import { ServerRequest, Response } from "https://deno.land/std/http/server.ts";
import * as Cookie from "https://deno.land/std/http/cookie.ts";

const decoder = new TextDecoder('utf-8');
const cookieName = "WordWolf_SessionID";

export interface LobbyForm {
  name: string;
  roomCode: number | undefined;
}

export async function readFormData(req: ServerRequest): Promise<Map<string, string>> {
  const buf: Uint8Array = await Deno.readAll(req.body);
  const reqBody: string = decoder.decode(buf);
  const formData = new Map<string, string>();
  for (const s of reqBody.split("&")) {
    const kv = s.split("=");
    if (kv.length < 2) continue;
    formData.set(kv[0], kv[1]);
  }
  return formData;
}

export async function readLobbyForm(req: ServerRequest): Promise<LobbyForm> {
  const formData = await readFormData(req);
  return { 
    name: formData.get("name") ?? "Player", 
    roomCode: Number(formData.get("roomcode"))
  };
}

export function setSessionCookie(res: Response, sessionId: string) {
  const cookie: Cookie.Cookie = { name: cookieName, value: sessionId, sameSite: "Lax" };
  Cookie.setCookie(res, cookie);
}

export function getSessionCookie(req: ServerRequest): string | undefined {
  return Cookie.getCookies(req)[cookieName];
}

// export function setCookieHeader(res: Response, name: string, anyVal: any) {
//   const value: string = (typeof anyVal === 'string') ? anyVal : JSON.stringify(anyVal);
//   const cookie: Cookie.Cookie = { name, value };
//   Cookie.setCookie(res, cookie);
// }