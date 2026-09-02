describe("config", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("falls back to defaults when env vars are unset", () => {
    delete process.env.UPSTREAM_TIMEOUT_MS;
    const { config } = require("../src/config");
    expect(config.upstreamTimeoutMs).toBe(5000);
    expect(config.port).toBe(8080);
  });

  it("throws at startup on a non-numeric UPSTREAM_TIMEOUT_MS instead of silently producing NaN", () => {
    process.env.UPSTREAM_TIMEOUT_MS = "not-a-number";
    expect(() => require("../src/config")).toThrow(/Invalid env var UPSTREAM_TIMEOUT_MS/);
  });

  it("throws on a negative PORT", () => {
    process.env.PORT = "-1";
    expect(() => require("../src/config")).toThrow(/Invalid env var PORT/);
  });
});
