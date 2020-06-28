import { ServerRequest } from "https://deno.land/std/http/server.ts";

const decoder = new TextDecoder('utf-8');

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

export async function readJoinForm(req: ServerRequest): Promise<{ roomId: string | undefined, name: string | undefined }> {
  const formData = await readFormData(req);
  return { roomId: formData.get("roomid"), name: formData.get("name") };
}