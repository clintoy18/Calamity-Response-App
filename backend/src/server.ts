// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

interface EmergencyRequest {
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes: string;
}

interface EmergencyRecord extends Location, EmergencyRequest {
  id: string;
  status: 'pending' | 'responded' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

// In-memory database (replace with real database in production)
let emergencies: EmergencyRecord[] = [];

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all emergencies
app.get('/api/emergencies', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: emergencies.length,
    data: emergencies
  });
});

// Get single emergency by ID
app.get('/api/emergencies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const emergency = emergencies.find(e => e.id === id);
  
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
});

// Create new emergency request
app.post('/api/emergencies', (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
      needs,
      numberOfPeople,
      urgencyLevel,
      additionalNotes
    } = req.body;

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

    const newEmergency: EmergencyRecord = {
      id: 'EMG-' + uuidv4(),
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date().toISOString(),
      needs,
      numberOfPeople: numberOfPeople || 1,
      urgencyLevel: urgencyLevel || 'medium',
      additionalNotes: additionalNotes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    emergencies.push(newEmergency);

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
app.patch('/api/emergencies/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'responded', 'resolved'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: pending, responded, or resolved'
    });
  }

  const emergencyIndex = emergencies.findIndex(e => e.id === id);
  
  if (emergencyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Emergency request not found'
    });
  }

  emergencies[emergencyIndex].status = status;
  emergencies[emergencyIndex].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Emergency status updated',
    data: emergencies[emergencyIndex]
  });
});

// Delete emergency
app.delete('/api/emergencies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const emergencyIndex = emergencies.findIndex(e => e.id === id);
  
  if (emergencyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Emergency request not found'
    });
  }

  emergencies.splice(emergencyIndex, 1);

  res.json({
    success: true,
    message: 'Emergency request deleted'
  });
});

// Delete all emergencies (for testing)
app.delete('/api/emergencies', (req: Request, res: Response) => {
  emergencies = [];
  res.json({
    success: true,
    message: 'All emergency requests cleared'
  });
});

// Get emergencies by urgency
app.get('/api/emergencies/urgency/:level', (req: Request, res: Response) => {
  const { level } = req.params;
  const filtered = emergencies.filter(e => e.urgencyLevel === level);
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get emergencies by status
app.get('/api/emergencies/status/:status', (req: Request, res: Response) => {
  const { status } = req.params;
  const filtered = emergencies.filter(e => e.status === status);
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Emergency Relief API is ready`);
});