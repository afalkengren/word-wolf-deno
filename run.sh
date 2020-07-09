tsc --build client/tsconfig.json
deno run --unstable --allow-net --allow-read server/server_main.ts
