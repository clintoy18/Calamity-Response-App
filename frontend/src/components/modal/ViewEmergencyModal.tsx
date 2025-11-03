import React, { useState } from "react";
import { API_URL } from "../../constants";
import type { IEmergency } from "../../hooks/queries/useAdmin";
import api from "../../services/authService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { 
  CheckCircle2, 
  X, 
  MapPin, 
  Phone, 
  Users, 
  AlertTriangle,
  Image as ImageIcon,
  Shield
} from "lucide-react";

interface VerifyEmergencyModalProps {
  emergency: IEmergency;
  onClose: () => void;
  onConfirm: () => void; // ← add this
}

const UrgencyIndicator: React.FC<{ level: string }> = ({ level }) => {
  const levels = {
    CRITICAL: { color: "bg-red-500", pulse: true },
    HIGH: { color: "bg-orange-500", pulse: true },
    MEDIUM: { color: "bg-yellow-500", pulse: false },
    LOW: { color: "bg-green-500", pulse: false }
  };

  const config = levels[level as keyof typeof levels] || levels.MEDIUM;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium capitalize">{level.toLowerCase()}</span>
    </div>
  );
};

const DetailCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({ 
  icon, 
  title, 
  value 
}) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
    <div className="text-gray-600 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{title}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const NeedsPills: React.FC<{ needs?: string[] }> = ({ needs }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-blue-500 rounded-full" />
      <p className="text-sm font-semibold text-gray-900">Required Assistance</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {needs?.map((need, i) => (
        <div
          key={i}
          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
        >
          {need}
        </div>
      ))}
    </div>
  </div>
);

const ImageSection: React.FC<{ src: string; onExpand: () => void }> = ({ src, onExpand }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-gray-900 rounded-full" />
      <p className="text-sm font-semibold text-gray-900">Verification Image</p>
    </div>
    <div 
      className="relative group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-gray-50"
      onClick={onExpand}
    >
      <img
        src={src}
        alt="Emergency verification"
        className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="w-4 h-4 text-gray-700" />
      </div>
    </div>
  </div>
);

export const VerifyEmergencyModal: React.FC<VerifyEmergencyModalProps> = ({
  emergency,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const getImageSrc = (src: string) =>
    src.startsWith("http") ? src : `${API_URL}/uploads/${src}`;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`${API_URL}/admin/emergencies/${emergency._id}/approve`, {});
      setSuccess(true);
      onConfirm?.();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error("Failed to approve emergency:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to approve emergency.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
              <p className="text-gray-600 text-sm">
                Emergency report has been verified and will be processed
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          {/* Header with subtle pattern */}
          <DialogHeader className="p-6 pb-4 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-900 to-gray-700" />
            <div className="flex items-start justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Verify Emergency
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Review and confirm emergency details
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6 max-h-[65vh] overflow-y-auto">
            {/* Status & Urgency */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {emergency.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Urgency</p>
                <UrgencyIndicator level={emergency.urgencyLevel.toUpperCase()} />
              </div>
            </div>

            {/* Emergency Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailCard
                icon={<MapPin className="w-4 h-4" />}
                title="Location"
                value={emergency.placename}
              />
              <DetailCard
                icon={<Phone className="w-4 h-4" />}
                title="Contact"
                value={emergency.contactno || ""}
              />
              <DetailCard
                icon={<Users className="w-4 h-4" />}
                title="People Affected"
                value={`${emergency.numberOfPeople} people`}
              />
              <DetailCard
                icon={<AlertTriangle className="w-4 h-4" />}
                title="Report Type"
                value="Emergency Assistance"
              />
            </div>

            {/* Needs Section */}
            {emergency.needs && emergency.needs.length > 0 && (
              <NeedsPills needs={emergency.needs} />
            )}

            {/* Image Verification */}
            {emergency.imageVerification && (
              <ImageSection
                src={getImageSrc(emergency.imageVerification)}
                onExpand={() => setImageModalOpen(true)}
              />
            )}
          </div>

          {/* Action Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verify Emergency
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setImageModalOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <img
              src={getImageSrc(emergency.imageVerification!)}
              alt="Emergency Verification"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};