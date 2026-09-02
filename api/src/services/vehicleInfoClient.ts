import { config } from "../config";
import { VehicleData, VehicleInfoError } from "../types";

interface UpstreamSuccess {
  success: true;
  data: VehicleData;
}

interface UpstreamError {
  success?: boolean;
  error: string;
}

function isUpstreamSuccess(body: unknown): body is UpstreamSuccess {
  return (
    !!body &&
    typeof body === "object" &&
    (body as { success?: unknown }).success === true &&
    !!(body as { data?: unknown }).data
  );
}

/**
 * Calls the upstream insurance-webhook /vehicle-info endpoint once, with a
 * timeout, and maps its response onto our own error taxonomy.
 */
export async function fetchVehicleInfo(licensePlate: string): Promise<VehicleData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);

  let response: Response;
  try {
    response = await fetch(config.upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_plate: licensePlate }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new VehicleInfoError(
      "UPSTREAM_UNAVAILABLE",
      504,
      `שירות המידע על הרכב אינו זמין כרגע: ${(err as Error).message}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 404) {
    const body = (await safeJson(response)) as UpstreamError | null;
    throw new VehicleInfoError(
      "VEHICLE_NOT_FOUND",
      404,
      body?.error ?? `רכב עם מספר ${licensePlate} לא נמצא במאגר`
    );
  }

  if (response.status === 400 || response.status === 422) {
    const body = await safeJson(response);
    throw new VehicleInfoError(
      "VALIDATION_ERROR",
      400,
      extractUpstreamValidationMessage(body) ?? "פורמט מספר רכב לא תקין"
    );
  }

  if (!response.ok) {
    throw new VehicleInfoError(
      "UPSTREAM_ERROR",
      502,
      `שירות המידע על הרכב החזיר שגיאה (HTTP ${response.status})`
    );
  }

  const body = await safeJson(response);
  if (!isUpstreamSuccess(body)) {
    throw new VehicleInfoError(
      "UPSTREAM_ERROR",
      502,
      "שירות המידע על הרכב החזיר תשובה לא תקינה"
    );
  }

  return body.data;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractUpstreamValidationMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  if (detail && typeof detail === "object" && "error" in detail) {
    return String((detail as { error?: unknown }).error);
  }
  const directError = (body as { error?: unknown }).error;
  return typeof directError === "string" ? directError : undefined;
}
