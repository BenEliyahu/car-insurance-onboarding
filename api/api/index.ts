import { createApp } from "../src/app";

// Vercel serverless entrypoint: Express apps are directly compatible with
// the Node.js (req, res) handler signature Vercel expects — no adapter
// needed. `server.ts` (with app.listen) stays the entrypoint for local
// dev and non-serverless hosts (Render/Docker).
export default createApp();
