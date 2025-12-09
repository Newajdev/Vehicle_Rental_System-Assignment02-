import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.CONNECTION_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const initDB = async () => {
  await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'customer')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(20) CHECK (type IN ('car', 'bike', 'van', 'SUV')) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        daily_rent_price DECIMAL(10, 0) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'booked')) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date TIMESTAMP NOT NULL,
        rent_end_date TIMESTAMP NOT NULL,
        total_price DECIMAL(10, 0) NOT NULL CHECK (total_price > 0),
        status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'returned')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (rent_end_date > rent_start_date)
      );
    `);
};
