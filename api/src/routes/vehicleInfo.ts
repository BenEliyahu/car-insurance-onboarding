import { Router, Request, Response, NextFunction } from "express";
import { vehicleInfoRequestSchema } from "../validation/licensePlate";
import { fetchVehicleInfo } from "../services/vehicleInfoClient";
import { VehicleInfoError } from "../types";

export const vehicleInfoRouter = Router();

vehicleInfoRouter.post(
  "/vehicle-info",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = vehicleInfoRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "בקשה לא תקינה",
        },
      });
    }

    try {
      const data = await fetchVehicleInfo(parsed.data.license_plate);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return next(err);
    }
  }
);

export function vehicleInfoErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof VehicleInfoError) {
    console.warn(`[${err.code}] plate=${req.body?.license_plate}: ${err.message}`);
    return res.status(err.httpStatus).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  console.error("Unhandled error in vehicle-info route:", err);
  return res.status(500).json({
    success: false,
    error: { code: "UPSTREAM_ERROR", message: "שגיאה פנימית בשרת" },
  });
}
