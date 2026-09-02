import { vehicleInfoRequestSchema } from "../src/validation/licensePlate";

describe("vehicleInfoRequestSchema", () => {
  it("accepts a 7-digit plate", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "1234567" });
    expect(result.success).toBe(true);
  });

  it("accepts an 8-digit plate", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "12345678" });
    expect(result.success).toBe(true);
  });

  it("strips dashes and spaces before validating", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "123-45-678" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.license_plate).toBe("12345678");
    }
  });

  it("rejects plates that are too short", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects plates that are too long", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "123456789" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric plates", () => {
    const result = vehicleInfoRequestSchema.safeParse({ license_plate: "abcdefg" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing license_plate field", () => {
    const result = vehicleInfoRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
