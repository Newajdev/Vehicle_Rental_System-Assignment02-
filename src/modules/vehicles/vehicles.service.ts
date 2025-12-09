import { pool } from "../../config/db";

const createVehicle = async (vehicleData: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = vehicleData;
  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
     VALUES ($1, $2, $3, $4, $5) RETURNING  id,vehicle_name,type,registration_number,daily_rent_price,availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status || "available",
    ]
  );
  return result;
};

const getAllVehicles = async () => {
  const result = await pool.query(
    "SELECT id,vehicle_name,type,registration_number,daily_rent_price,availability_status FROM vehicles"
  );
  return result;
};

const getVehicleById = async (id: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  delete result.rows[0].created_at;
  return result;
};

const updateVehicle = async (
  id: number,
  vehicle_name: string,
  type: string,
  registration_number: string,
  daily_rent_price: number,
  availability_status: string
) => {
  const result = await pool.query(
    `UPDATE vehicles SET vehicle_name=$2, type=$3, registration_number=$4, daily_rent_price=$5, availability_status=$6 WHERE id = $1 RETURNING id,vehicle_name,type,registration_number,daily_rent_price,availability_status`,
    [
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return result.rows[0];
};

const deleteVehicle = async (id: number) => {

  const activeBookings = await pool.query(
    "SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'",
    [id]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("Vehicle cannot be deleted because it has active bookings");
  }

  const result = await pool.query(
    "DELETE FROM vehicles WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const VehicleService = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
