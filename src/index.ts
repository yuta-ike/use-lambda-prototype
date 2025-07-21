import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { lambdaAction } from "./lambda";
import { logger } from "hono/logger";
import { calcApp } from "./routes/calc/route";

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.text("Hello Node.js!"));

app.get("/action", async function (c) {
  const result = await lambdaAction({
    name: c.req.query("name") ?? "Anon",
  });
  return c.text(result.message);
});

app.route("/calc", calcApp);

const server = serve(app);
console.log("Server is running on http://localhost:3000");

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
