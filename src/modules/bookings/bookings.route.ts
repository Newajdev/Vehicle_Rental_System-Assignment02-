import express from "express";
import { BookingController } from "./bookings.controller";

import auth from "../../middleware/auth";

const router = express.Router();

router.post("/", auth("admin", "customer"), BookingController.createBooking);
router.get("/", auth("admin", "customer"), BookingController.getAllBookings);
router.put("/:id", auth("admin", "customer"), BookingController.updateBooking);

export const BookingRoutes = router;
