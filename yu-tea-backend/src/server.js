import http from "node:http";
import { loadConfig } from "./config.js";
import { createApi } from "./app.js";
import { loadDotEnv } from "./env.js";
import { seedData } from "./seed.js";
import { JsonStore } from "./store.js";

loadDotEnv();
const config = loadConfig();
const store = await new JsonStore({ file: config.dataFile, seed: seedData }).init();
const api = createApi({ config, store });
const server = http.createServer(api);

server.listen(config.port, config.host, () => {
  console.log(`Yu Tea API listening at ${config.publicBaseUrl}`);
  console.log(`OpenAPI: ${config.publicBaseUrl}/openapi.json`);
  console.log(`Registered routes: ${api.routes.length}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing Yu Tea API`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
