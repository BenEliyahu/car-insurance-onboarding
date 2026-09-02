import { createApp } from "./app";
import { env } from "./config";

const app = createApp();

app.listen(env.port, () => {
  console.log(`vehicle-info-api listening on port ${env.port}`);
  console.log(`Upstream: ${env.upstreamUrl}`);
});
