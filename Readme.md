# 🚨 Emergency Relief App - Cebu

A real-time emergency relief request system with interactive map visualization for Cebu, Philippines. This application allows users to request help during emergencies and visualizes all active requests on an interactive map.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [File Descriptions](#file-descriptions)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## ✨ Features

- 🗺️ **Interactive Map**: OpenStreetMap integration with Leaflet.js
- 📍 **GPS Location**: Automatic location detection using browser's geolocation API
- 🆘 **Emergency Requests**: Submit requests with needs, urgency, and contact info
- 🔄 **Real-time Updates**: Automatic polling for new emergency requests every 10 seconds
- 🏘️ **Affected Areas**: Display earthquake-affected areas with intensity markers
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🔍 **Reverse Geocoding**: Automatic place name resolution
- 💾 **Data Persistence**: All requests stored in backend database

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Map**: Leaflet.js
- **Geocoding**: Nominatim (OpenStreetMap)
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── types/
│   └── index.ts                 # TypeScript interfaces and types
├── constants/
│   └── index.ts                 # App constants and configuration
├── services/
│   └── api.ts                   # API service layer
├── utils/
│   ├── geocoding.ts            # Reverse geocoding utilities
│   └── mapUtils.ts             # Map-related helper functions
├── hooks/
│   ├── useMapSetup.ts          # Map initialization hook
│   ├── useEmergencies.ts       # Emergency data management hook
│   └── useEmergencyMarkers.ts  # Map markers management hook
├── components/
│   ├── MapHeader.tsx           # Top header component
│   ├── AffectedAreasPanel.tsx  # Affected areas sidebar
│   ├── ActionButtons.tsx       # Main action buttons
│   ├── EmergencyModal.tsx      # Modal container
│   ├── EmergencyForm.tsx       # Request form
│   ├── LoadingState.tsx        # Loading screen
│   ├── SuccessState.tsx        # Success screen
│   └── ErrorState.tsx          # Error screen
└── EmergencyApp.tsx            # Main application component
```

## 🚀 Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API server running (see [API Endpoints](#api-endpoints))

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd emergency-relief-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install required packages**
   ```bash
   npm install react react-dom
   npm install leaflet @types/leaflet
   npm install lucide-react
   npm install -D tailwindcss postcss autoprefixer
   npm install -D typescript @types/react @types/react-dom
   ```

4. **Initialize Tailwind CSS** (if not already configured)
   ```bash
   npx tailwindcss init -p
   ```

5. **Configure Tailwind CSS** (`tailwind.config.js`)
   ```javascript
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

6. **Add Tailwind directives** to your CSS file (`src/index.css`)
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

7. **Create environment file** (`.env`)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

8. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: Map Configuration
VITE_MAP_CENTER_LAT=10.3157
VITE_MAP_CENTER_LNG=123.8854
```

### Customizing Constants

Edit `src/constants/index.ts` to customize:

- **Map boundaries**: `CEBU_BOUNDS`
- **Map center**: `CEBU_CENTER`
- **Urgency colors**: `urgencyColors`
- **Affected areas**: `affectedAreas`
- **Relief item options**: `needOptions`

## 📖 Usage

### Basic Usage

1. **Start the app**: Open the application in your browser
2. **Request Help**: Click the "Request Help" button
3. **Allow Location**: Grant location permission when prompted
4. **Fill Form**: Complete the emergency request form
5. **Submit**: Your request appears on the map immediately

### For Developers

#### Adding a New Component

```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  data: string;
}

export const MyComponent = ({ data }: MyComponentProps) => {
  return <div>{data}</div>;
};
```

#### Using Custom Hooks

```typescript
import { useEmergencies } from './hooks/useEmergencies';

function MyComponent() {
  const { emergencies, fetchEmergencies } = useEmergencies();
  
  // Use emergencies data
  return <div>{emergencies.length} active</div>;
}
```

#### Adding New API Endpoints

```typescript
// src/services/api.ts
export const myNewEndpoint = async () => {
  const response = await fetch(`${API_URL}/my-endpoint`);
  return response.json();
};
```

## 📄 File Descriptions

### Core Files

| File | Purpose |
|------|---------|
| `types/index.ts` | All TypeScript interfaces and type definitions |
| `constants/index.ts` | App-wide constants, colors, and configuration |
| `services/api.ts` | API calls and data fetching logic |
| `EmergencyApp.tsx` | Main application component with state management |

### Utilities

| File | Purpose |
|------|---------|
| `utils/geocoding.ts` | Reverse geocoding with caching |
| `utils/mapUtils.ts` | Map marker creation and popup content generation |

### Hooks

| File | Purpose |
|------|---------|
| `hooks/useMapSetup.ts` | Initializes Leaflet map with animations |
| `hooks/useEmergencies.ts` | Fetches and manages emergency data |
| `hooks/useEmergencyMarkers.ts` | Manages map markers and interactions |

### Components

| Component | Purpose |
|-----------|---------|
| `MapHeader.tsx` | Displays app title and active emergency count |
| `AffectedAreasPanel.tsx` | Shows earthquake-affected areas |
| `ActionButtons.tsx` | Main CTA buttons (Request Help, Clear All) |
| `EmergencyModal.tsx` | Modal container for all states |
| `EmergencyForm.tsx` | Emergency request form |
| `LoadingState.tsx` | Loading indicator |
| `SuccessState.tsx` | Success confirmation |
| `ErrorState.tsx` | Error display |

## 🔌 API Endpoints

Your backend should implement these endpoints:

### GET `/api/emergencies`
Fetch all emergency requests

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "EMG-123",
      "latitude": 10.3157,
      "longitude": 123.8854,
      "accuracy": 50,
      "needs": ["food", "water"],
      "numberOfPeople": 5,
      "urgencyLevel": "HIGH",
      "additionalNotes": "Need urgent help",
      "contactNo": "09171234567",
      "placeName": "Cebu City",
      "status": "pending",
      "createdAt": "2025-10-02T10:30:00Z",
      "updatedAt": "2025-10-02T10:30:00Z"
    }
  ]
}
```

### POST `/api/emergencies`
Create new emergency request

**Request Body:**
```json
{
  "latitude": 10.3157,
  "longitude": 123.8854,
  "accuracy": 50,
  "needs": ["food", "water"],
  "numberOfPeople": 5,
  "urgencyLevel": "HIGH",
  "additionalNotes": "Need urgent help",
  "contactno": "09171234567",
  "placename": "Cebu City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "EMG-123",
    "createdAt": "2025-10-02T10:30:00Z",
    "updatedAt": "2025-10-02T10:30:00Z",
    "placeName": "Cebu City"
  }
}
```

### DELETE `/api/emergencies`
Clear all emergency requests (admin only)

**Response:**
```json
{
  "success": true,
  "message": "All emergencies cleared"
}
```

## 🎨 Customization

### Changing Map Style

Edit `hooks/useMapSetup.ts`:

```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
  maxZoom: 19,
}).addTo(map);
```

Replace with other tile providers like:
- Mapbox
- Google Maps
- Stamen

### Modifying Urgency Colors

Edit `constants/index.ts`:

```typescript
export const urgencyColors = {
  low: { bg: '#10b981', text: 'Low', light: '#d1fae5' },
  medium: { bg: '#f59e0b', text: 'Medium', light: '#fef3c7' },
  high: { bg: '#f97316', text: 'High', light: '#ffedd5' },
  critical: { bg: '#ef4444', text: 'Critical', light: '#fee2e2' },
};
```

### Adding New Relief Items

Edit `constants/index.ts`:

```typescript
export const needOptions = [
  // ... existing options
  { 
    value: 'electricity', 
    label: 'Electricity', 
    icon: <Zap className="w-5 h-5" /> 
  },
];
```

## 🧪 Testing

### Running Tests

```bash
npm test
# or
yarn test
```

### Testing Individual Components

```bash
npm test -- MapHeader.test.tsx
```

## 📦 Building for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist/` directory.

## 🐛 Troubleshooting

### Common Issues

**Issue**: Map not loading
- **Solution**: Check if Leaflet CSS is imported correctly
- Ensure `leaflet/dist/leaflet.css` is imported in your component

**Issue**: Location permission denied
- **Solution**: Use HTTPS in production (geolocation requires secure context)
- Check browser location settings

**Issue**: API calls failing
- **Solution**: Verify `VITE_API_URL` in `.env` file
- Check if backend server is running
- Verify CORS settings on backend

**Issue**: Markers not appearing
- **Solution**: Check if coordinates are within Cebu bounds
- Verify emergency data structure from API

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for map library
- Lucide for icons
- Tailwind CSS for styling

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Email: your-email@example.com

---

Made with ❤️ for emergency relief efforts in Cebu