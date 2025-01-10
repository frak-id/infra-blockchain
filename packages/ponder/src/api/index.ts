import { ponder } from "ponder:registry";

ponder.get("/hello", async ({ text }) => {
    return text("Hello!");
});
