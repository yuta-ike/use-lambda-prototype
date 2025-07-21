import { Hono } from "hono";
import { calcAddition, calcSubtraction } from "./action";

const app = new Hono();

app.post("/addition", async (c) => {
  const { a, b } = await c.req.json<{ a: number; b: number }>();
  const answer = await calcAddition(a, b);
  return c.json({ answer });
});

app.post("/subtraction", async (c) => {
  const { a, b } = await c.req.json<{ a: number; b: number }>();
  const answer = await calcSubtraction(a, b);
  return c.json({ answer });
});

export { app as calcApp };
