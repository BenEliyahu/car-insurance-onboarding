function requireNumber(name: string, raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid env var ${name}="${raw}": expected a non-negative number`);
  }
  return parsed;
}

export const env = {
  port: requireNumber("PORT", process.env.PORT, 8080),
  upstreamUrl:
    process.env.UPSTREAM_URL ?? "https://insurance-webhook-945894769129.us-central1.run.app/vehicle-info",
  upstreamTimeoutMs: requireNumber("UPSTREAM_TIMEOUT_MS", process.env.UPSTREAM_TIMEOUT_MS, 5000),
};
