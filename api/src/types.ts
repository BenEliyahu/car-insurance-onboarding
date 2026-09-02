export interface VehicleData {
  license_plate: string;
  manufacturer: string;
  model: string;
  year: number;
  color: string;
}

export interface SuccessResponse {
  success: true;
  data: VehicleData;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "VEHICLE_NOT_FOUND"
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_ERROR";

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type VehicleInfoResponse = SuccessResponse | ErrorResponse;

export class VehicleInfoError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly httpStatus: number,
    message: string
  ) {
    super(message);
    this.name = "VehicleInfoError";
  }
}
