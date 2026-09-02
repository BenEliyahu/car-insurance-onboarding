import { z } from "zod";

const normalize = (raw: string) => raw.replace(/[\s-]/g, "");

export const vehicleInfoRequestSchema = z.object({
  license_plate: z
    .string({ required_error: "יש לספק מספר רכב (license_plate)" })
    .transform(normalize)
    .refine((s) => /^\d{7,8}$/.test(s), {
      message: "מספר רכב חייב להיות 7 או 8 ספרות",
    }),
});

export type VehicleInfoRequest = z.infer<typeof vehicleInfoRequestSchema>;
