import { Request, Response } from "express"
import { prisma } from "../config/prisma";
import { EmergencyRequestBody } from "../types/emergency.types";

// Emergencies CRUD

export const getEmergencies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Time filter
    const hoursAgo = parseInt(req.query.hours as string) || 12;
    const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const filter = { createdAt: { gte: timeThreshold } };

    // Fetch emergencies and total count in parallel
    const [emergencies, total] = await Promise.all([
      prisma.emergency.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emergency.count({ where: filter }),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      data: emergencies,
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEmergencyById = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    const emergency = await prisma.emergency.findUnique({
      where: { id }
    });
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
    res.json({
      success: true,
      data: emergency
    });
  } catch (error) {
    console.error('Error fetching emergency:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export const createEmergency = async (req: Request, res: Response) => {
    try {
    const {
      latitude,
      longitude,
      placename,
      contactno,
      accuracy,
      needs,
      numberOfPeople,
      urgencyLevel,
      additionalNotes
    }: EmergencyRequestBody = req.body;

    console.log(placename)

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (!needs || needs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one need must be specified'
      });
    }

    // Check if location is in Cebu bounds
    // const isInCebu = latitude >= 9.8 && latitude <= 10.8 && 
    //                  longitude >= 123.3 && longitude <= 124.4;
    
    // if (!isInCebu) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Location is outside Cebu area'
    //   });
    // }

    const newEmergency = await prisma.emergency.create({
      data: {
        latitude,
        longitude,
        placename,
        contactno,  
        accuracy: accuracy || 0,
        timestamp: new Date(),
        needs: needs, // PostgreSQL supports arrays directly
        numberOfPeople: numberOfPeople || 1,
        urgencyLevel: urgencyLevel || 'medium',
        additionalNotes: additionalNotes || '',
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Emergency request created successfully',
      data: newEmergency
    });
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
export const updateEmergency = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'responded', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, responded, or resolved'
      });
    }

    const emergency = await prisma.emergency.update({
      where: { id },
      data: { 
        status, 
        updatedAt: new Date() 
      }
    });

    res.json({
      success: true,
      message: 'Emergency status updated',
      data: emergency
    });
  } catch (error) {
    console.error('Error updating emergency:', error);
    res.status(404).json({
      success: false,
      message: 'Emergency request not found'
    });
  }
}
export const deleteEmergencyById = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    await prisma.emergency.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Emergency request deleted'
    });
  } catch (error) {
    console.error('Error deleting emergency:', error);
    res.status(404).json({
      success: false,
      message: 'Emergency request not found'
    });
  }
}
export const deleteAllEmergencies = async (req: Request, res: Response) => {
    try {
    await prisma.emergency.deleteMany();
    res.json({
      success: true,
      message: 'All emergency requests cleared'
    });
  } catch (error) {
    console.error('Error clearing emergencies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

// Filtering
export const getEmergenciesByUrgency = async (req: Request, res: Response) => {
    try {
    const { level } = req.params;
    const filtered = await prisma.emergency.findMany({
      where: { urgencyLevel: level },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching emergencies by urgency:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}
export const getEmergenciesByStatus = async (req: Request, res: Response) => {
    try {
    const { status } = req.params;
    const filtered = await prisma.emergency.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching emergencies by status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}
