import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import config from "../../config";

const registerUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  if ((password as string).length < 6) {
    throw new Error(
      "Your Password length must be more than or equal 6 character"
    );
  }

  
  const hashedPassword = await bcrypt.hash(password as string, 12);

  const result = await pool.query(
    "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role",
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const loginUser = async (payload: Record<string, unknown>) => {
  const { email, password } = payload;

  const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult.rows[0];


  const isPasswordMatched = await bcrypt.compare(
    password as string,
    user.password
  );
  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret as string, {
    expiresIn: "7d",
  });


  delete user.password;
  delete user.created_at;

  return {
    token,
    user
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
