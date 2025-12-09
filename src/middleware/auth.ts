import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: number; role: string; email: string };
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new Error("You are not authorized!");
      }
      const decoded = jwt.verify(
        token,
        config.jwtSecret as string
      ) as JwtPayload & { role: string; email: string };

      const { role, email } = decoded;

      const userCheck = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (userCheck.rows.length === 0) {
        throw new Error("User not found!");
      }

      const normalizedRole = role?.toLowerCase();
      const normalizedRequiredRoles = requiredRoles.map(r => r.toLowerCase());

      if (requiredRoles.length && !normalizedRequiredRoles.includes(normalizedRole)) {
        throw new Error(
          `Access denied. Required roles: ${requiredRoles.join(", ")}. Your role: ${role}`
        );
      }

      req.user = { ...decoded, id: userCheck.rows[0].id, role, email };
      next();
    } catch (error: any) {
      const statusCode = error.message?.startsWith("Access denied")
        ? 403
        : 401;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error,
      });
    }
  };
};

export default auth;
