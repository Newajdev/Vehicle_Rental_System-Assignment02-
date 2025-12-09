import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users"
  );
  return result;
};

const updateUser = async (
  id: number,
  name: string,
  email: string,
  phone: string,
  role: string
) => {
  const result = await pool.query(
    `UPDATE users SET name=$2, email=$3, phone=$4, role=$5 WHERE id = $1 RETURNING id,name,email,phone,role`,
    [id, name, email, phone, role]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  return result.rows[0];
};

const deleteUser = async (id: number) => {
  const activeBookings = await pool.query(
    "SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [id]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("User cannot be deleted because they have active bookings");
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
};

export const UserService = {
  getAllUsers,
  updateUser,
  deleteUser,
};
