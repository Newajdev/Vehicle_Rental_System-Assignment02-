import { Request, Response } from "express";
import { BookingService } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.createBooking(req.body);
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllBookings = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.getAllBookings(req.user!);
        const message = req.user!.role === "customer"
            ? "Your bookings retrieved successfully"
            : "Bookings retrieved successfully";
        res.status(200).json({
            success: true,
            message,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateBooking = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.updateBooking(Number(req.params.id), req.body, req.user);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Booking not found",
            });
            return;
        }
        let message = "Booking updated successfully";
        if (req.body.status === "cancelled") {
            message = "Booking cancelled successfully";
        } else if (req.body.status === "returned") {
            message = "Booking marked as returned. Vehicle is now available";
        }
        res.status(200).json({
            success: true,
            message,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const BookingController = {
    createBooking,
    getAllBookings,
    updateBooking
};
