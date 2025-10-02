interface MapHeaderProps {
  emergencyCount: number;
}

export const MapHeader = ({ emergencyCount }: MapHeaderProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-semibold text-gray-800">Emergency Relief - Cebu</span>
      </div>
      {emergencyCount > 0 && (
        <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-semibold">
          {emergencyCount} Active
        </div>
      )}
    </div>
  );
};