import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

function mockFetchOnce(status: number, body: unknown) {
  return jest
    .spyOn(global, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

describe("POST /vehicle-info", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 200 with vehicle data on success", async () => {
    mockFetchOnce(200, {
      success: true,
      data: {
        license_plate: "12345678",
        manufacturer: "טויוטה",
        model: "קורולה",
        year: 2020,
        color: "לבן",
      },
    });

    const res = await request(app)
      .post("/vehicle-info")
      .send({ license_plate: "12345678" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.manufacturer).toBe("טויוטה");
  });

  it("returns 400 for a malformed license plate without calling upstream", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    const res = await request(app)
      .post("/vehicle-info")
      .send({ license_plate: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 404 with VEHICLE_NOT_FOUND when upstream returns 404", async () => {
    mockFetchOnce(404, { success: false, error: "רכב עם מספר 99999999 לא נמצא במאגר" });

    const res = await request(app)
      .post("/vehicle-info")
      .send({ license_plate: "99999999" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("VEHICLE_NOT_FOUND");
  });

  it("returns 502 UPSTREAM_ERROR when upstream returns a 500", async () => {
    mockFetchOnce(500, { detail: "internal error" });

    const res = await request(app)
      .post("/vehicle-info")
      .send({ license_plate: "12345678" });

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });

  it("returns 504 UPSTREAM_UNAVAILABLE when upstream is unreachable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

    const res = await request(app)
      .post("/vehicle-info")
      .send({ license_plate: "12345678" });

    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe("UPSTREAM_UNAVAILABLE");
  });
});
