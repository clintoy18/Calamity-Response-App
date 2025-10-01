import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Types
type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

interface EmergencyRequestBody {
  latitude: number;
  longitude: number;
  accuracy: number;
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalNotes?: string;
}

// Routes

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Server and database are running' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Get all emergencies
app.get('/api/emergencies', async (req: Request, res: Response) => {
  try {
    const emergencies = await prisma.emergency.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergencies'
    });
  }
});

// Get single emergency by ID
app.get('/api/emergencies/:id', async (req: Request, res: Response) => {
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
      message: 'Failed to fetch emergency'
    });
  }
});

// Create new emergency request
app.post('/api/emergencies', async (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
      needs,
      numberOfPeople,
      urgencyLevel,
      additionalNotes
    }: EmergencyRequestBody = req.body;

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
    const isInCebu = latitude >= 9.8 && latitude <= 10.8 && 
                     longitude >= 123.3 && longitude <= 124.4;
    
    if (!isInCebu) {
      return res.status(400).json({
        success: false,
        message: 'Location is outside Cebu area'
      });
    }

    const newEmergency = await prisma.emergency.create({
      data: {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        needs,
        numberOfPeople: numberOfPeople || 1,
        urgencyLevel: urgencyLevel || 'MEDIUM',
        additionalNotes: additionalNotes || null
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
});

// Update emergency status
app.patch('/api/emergencies/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'RESPONDED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: PENDING, RESPONDED, or RESOLVED'
      });
    }

    const emergency = await prisma.emergency.update({
      where: { id },
      data: { status }
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
});

// Delete emergency
app.delete('/api/emergencies/:id', async (req: Request, res: Response) => {
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
});

// Delete all emergencies (for testing)
app.delete('/api/emergencies', async (req: Request, res: Response) => {
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
      message: 'Failed to clear emergencies'
    });
  }
});

// Get emergencies by urgency
app.get('/api/emergencies/urgency/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const urgencyLevel = level.toUpperCase();
    
    const emergencies = await prisma.emergency.findMany({
      where: { urgencyLevel: urgencyLevel as any },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies by urgency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergencies'
    });
  }
});

// Get emergencies by status
app.get('/api/emergencies/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const statusValue = status.toUpperCase();
    
    const emergencies = await prisma.emergency.findMany({
      where: { status: statusValue as any },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergencies'
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Emergency Relief API is ready`);
  console.log(`🗄️  Database connected`);
});