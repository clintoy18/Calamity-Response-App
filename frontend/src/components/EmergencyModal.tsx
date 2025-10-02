import type { Status, Location, NeedType } from '../types';
import { LoadingState } from './LoadingState';
import { SuccessState } from './SuccessState';
import { ErrorState } from './ErrorState';
import { EmergencyForm } from './EmergencyForm';

interface EmergencyModalProps {
  status: Status;
  location: Location | null;
  placeName: string;
  contactNo: string;
  setContactNo: (value: string) => void;
  selectedNeeds: NeedType[];
  toggleNeed: (need: NeedType) => void;
  numberOfPeople: number;
  setNumberOfPeople: (value: number) => void;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  setUrgencyLevel: (level: 'low' | 'medium' | 'high' | 'critical') => void;
  additionalNotes: string;
  setAdditionalNotes: (value: string) => void;
  errorMessage: string;
  onSubmit: () => void;
  onReset: () => void;
  setStatus: (status: Status) => void;
}

export const EmergencyModal = ({
  status,
  location,
  placeName,
  contactNo,
  setContactNo,
  selectedNeeds,
  toggleNeed,
  numberOfPeople,
  setNumberOfPeople,
  urgencyLevel,
  setUrgencyLevel,
  additionalNotes,
  setAdditionalNotes,
  errorMessage,
  onSubmit,
  onReset,
  setStatus,
}: EmergencyModalProps) => {
  if (status === 'idle') return null;

  const handleRetry = () => {
    if (location) {
      setStatus('form');
    } else {
      setStatus('idle');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
        {status === 'loading' && <LoadingState hasLocation={!!location} />}

        {status === 'form' && location && (
          <EmergencyForm
            location={location}
            placeName={placeName}
            contactNo={contactNo}
            setContactNo={setContactNo}
            selectedNeeds={selectedNeeds}
            toggleNeed={toggleNeed}
            numberOfPeople={numberOfPeople}
            setNumberOfPeople={setNumberOfPeople}
            urgencyLevel={urgencyLevel}
            setUrgencyLevel={setUrgencyLevel}
            additionalNotes={additionalNotes}
            setAdditionalNotes={setAdditionalNotes}
            errorMessage={errorMessage}
            onSubmit={onSubmit}
            onClose={onReset}
          />
        )}

        {status === 'success' && (
          <SuccessState onReset={onReset} onClose={() => setStatus('idle')} />
        )}

        {status === 'error' && (
          <ErrorState 
            errorMessage={errorMessage} 
            onRetry={handleRetry} 
          />
        )}
      </div>
    </div>
  );
};