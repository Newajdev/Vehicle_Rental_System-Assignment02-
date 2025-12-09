import { Request, Response } from "express";
import { VehicleService } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await VehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await VehicleService.getAllVehicles();

    if (result.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: result.rows,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const result = await VehicleService.getVehicleById(Number(req.params.id));
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Vehicle retrieved successfully",
        data: result.rows[0],
      });
      }
      
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;
  try {
    const result = await VehicleService.updateVehicle(
      Number(req.params.id),
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    );
    if (!result) {
     return res.status(404).json({
       success: false,
       message: "Vehicle not found",
     });
      
    }
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await VehicleService.deleteVehicle(Number(req.params.id));
    if (!result) {
     return res.status(404).json({
       success: false,
       message: "Vehicle not found",
     });
      
    }
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const VehicleController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
