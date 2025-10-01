// server.ts with Prisma PostgreSQL
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';


const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();
const emergencyEmitter = new EventEmitter();

interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  needs: string[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  placeName?: string;
  contactNo?: string;
  additionalNotes?: string;
  status?: 'pending' | 'responded' | 'resolved';
  createdAt: string;
}

let emergencies: Emergency[] = [];

// Middleware
app.use(cors());
app.use(express.json());

// Types
type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

interface EmergencyRequestBody {
  latitude: number;
  longitude: number;
  placename: string;
  contactno: string;
  accuracy: number;
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes?: string;
}

// Routes

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Emergency Relief API with PostgreSQL is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
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
      message: 'Server error' 
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
      message: 'Server error' 
    });
  }
});

// Create new emergency request
app.post('/api/emergencies', async (req: Request, res: Response) => {
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

    emergencyEmitter.emit('new', newEmergency);

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

app.get('/emergencies/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEmergency = (emergency: Emergency) => {
    res.write(`data: ${JSON.stringify(emergency)}\n\n`);
  };

  emergencyEmitter.on('new', sendEmergency);

  req.on('close', () => {
    emergencyEmitter.off('new', sendEmergency);
  });
});

// Update emergency status
app.patch('/api/emergencies/:id/status', async (req: Request, res: Response) => {
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
      message: 'Server error' 
    });
  }
});

// Get emergencies by urgency
app.get('/api/emergencies/urgency/:level', async (req: Request, res: Response) => {
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
});

// Get emergencies by status
app.get('/api/emergencies/status/:status', async (req: Request, res: Response) => {
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
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Emergency Relief API with PostgreSQL is ready`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

// Cleanup on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});