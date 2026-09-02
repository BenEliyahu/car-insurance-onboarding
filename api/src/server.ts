import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`vehicle-info-api listening on port ${config.port}`);
  console.log(`Upstream: ${config.upstreamUrl}`);
});
