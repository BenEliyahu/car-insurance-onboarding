import express, { Express } from "express";
import path from "path";
import { vehicleInfoRouter, vehicleInfoErrorHandler } from "./routes/vehicleInfo";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use(vehicleInfoRouter);
  app.use(vehicleInfoErrorHandler);

  return app;
}
