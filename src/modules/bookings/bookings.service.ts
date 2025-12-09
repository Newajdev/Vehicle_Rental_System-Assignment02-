import { pool } from "../../config/db";

const createBooking = async (bookingData: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingData;

  const vehicleData = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicle_id,
  ]);

  const Vehicle = vehicleData.rows[0];

  if (!Vehicle) {
    throw new Error("Vehicle not found");
  }

  if (Vehicle.availability_status !== "available") {
    throw new Error(
      "You can't Book this Vehicle. Because this Vehicle is already in rent"
    );
  }

  const start = new Date(rent_start_date as string);
  const end = new Date(rent_end_date as string);

  const timeCont = end.getTime() - start.getTime();
  const number_of_days = Math.ceil(timeCont / (1000 * 60 * 60 * 24));
  const total_price = Vehicle.daily_rent_price * number_of_days;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const booking = await client.query(
      `INSERT INTO bookings 
       (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    await client.query(
      `UPDATE vehicles 
       SET availability_status = 'booked' 
       WHERE id = $1`,
      [vehicle_id]
    );

    await client.query("COMMIT");

    delete booking.rows[0].created_at;

    return {
      ...booking.rows[0],
      vehicle: {
        vehicle_name: Vehicle.vehicle_name,
        daily_rent_price: Vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const autoReturnExpiredBookings = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const expiredBookings = await client.query(
      `SELECT id, vehicle_id 
       FROM bookings 
       WHERE status = 'active' 
       AND rent_end_date < NOW()`
    );

    for (const booking of expiredBookings.rows) {
      await client.query(
        `UPDATE bookings SET status = 'returned' WHERE id = $1`,
        [booking.id]
      );

      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAllBookings = async (user: any) => {
  await autoReturnExpiredBookings();

  if (!user || !user.id || !user.role) {
    throw new Error("Invalid user data");
  }

  if (user.role === "admin") {
    const query = `
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows.map((booking: any) => {
      const {
        customer_name,
        customer_email,
        vehicle_name,
        registration_number,
        type,
        created_at,
        ...bookingData
      } = booking;

      return {
        ...bookingData,
        customer: {
          name: customer_name,
          email: customer_email,
        },
        vehicle: {
          vehicle_name,
          registration_number,
        },
      };
    });
  } else {
    const query = `
      SELECT 
        b.*,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [user.id]);

    return result.rows.map((booking: any) => {
      const {
        customer_id,
        vehicle_name,
        registration_number,
        type,
        created_at,
        ...bookingData
      } = booking;

      return {
        ...bookingData,
        vehicle: {
          vehicle_name,
          registration_number,
          type,
        },
      };
    });
  }
};

const getBookingById = async (id: number) => {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
  return result.rows[0];
};

const updateBooking = async (
  id: number,
  bookingData: Record<string, unknown>,
  user: any
) => {
  const keys = Object.keys(bookingData);
  const values = Object.values(bookingData);

  if (keys.length === 0) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingBooking = await client.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (existingBooking.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    if (user.role === "customer" && existingBooking.rows[0].customer_id !== user.id) {
      await client.query("ROLLBACK");
      throw new Error("You are not authorized to update this booking");
    }

    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const result = await client.query(
      `UPDATE bookings 
       SET ${setClause} 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );

    let vehicleData = null;

    if (
      bookingData.status === "returned" ||
      bookingData.status === "cancelled"
    ) {
      const vehicleResult = await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1 RETURNING availability_status`,
        [result.rows[0].vehicle_id]
      );
      vehicleData = vehicleResult.rows[0];
    }

    await client.query("COMMIT");

    const responseData: any = { ...result.rows[0] };

    if (vehicleData) {
      responseData.vehicle = {
        availability_status: vehicleData.availability_status,
      };
    }

    return responseData;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteBooking = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM bookings WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  autoReturnExpiredBookings,
};
