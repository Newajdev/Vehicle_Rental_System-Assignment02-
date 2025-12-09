import express from "express";
import { VehicleController } from "./vehicles.controller";

import auth from "../../middleware/auth";

const router = express.Router();

router.post("/", auth("admin"), VehicleController.createVehicle);
router.get("/", VehicleController.getAllVehicles);
router.get("/:id", VehicleController.getVehicleById);
router.put("/:id", auth("admin"), VehicleController.updateVehicle);
router.delete("/:id", auth("admin"), VehicleController.deleteVehicle);

export const VehicleRoutes = router;
