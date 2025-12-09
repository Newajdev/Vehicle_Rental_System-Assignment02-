import express from "express";
import config from "./config";
import cors from "cors";
import { initDB } from "./config/db";
import { AuthRoutes } from "./modules/auth/auth.route";
import { UserRoutes } from "./modules/users/users.route";
import { VehicleRoutes } from "./modules/vehicles/vehicles.route";
import { BookingRoutes } from "./modules/bookings/bookings.route";
const PORT = config.port || 5000;

const app = express();
app.use(express.json());
app.use(cors());

initDB();

app.get("/", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Vehicle Rental System Server is Running",
      data: "Response data",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/vehicles", VehicleRoutes);
app.use("/api/v1/bookings", BookingRoutes);

app.listen(PORT, () => {
  console.log(`Vehicle Rental System Server is Running on PORT ${PORT}`);
});
