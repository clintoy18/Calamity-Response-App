import React, { useState, useEffect } from "react";
import type { IUser } from "../../hooks/queries/useAdmin";
import { API_URL } from "../../constants";
import api from "../../services/authService";
import { 
  User, 
  Mail, 
  Phone, 
  Shield,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

interface VerifyRespondentModalProps {
  respondent: IUser;
  onClose: () => void;
  onSuccess?: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { variant: "secondary" as const, icon: Clock },
    approved: { variant: "default" as const, icon: CheckCircle2 },
    rejected: { variant: "destructive" as const, icon: AlertCircle }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 py-1.5 px-3">
      <IconComponent className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ 
  icon, 
  label, 
  value 
}) => (
  <Card className="overflow-hidden border-l-4 border-l-blue-500">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground break-words">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DocumentPreview: React.FC<{ 
  title: string; 
  url: string | null; 
  onExpand?: () => void;
  loading?: boolean;
}> = ({ title, url, onExpand, loading }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-primary rounded-full" />
      <p className="text-sm font-semibold">{title}</p>
    </div>
    
    {loading ? (
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading document...</span>
          </div>
        </CardContent>
      </Card>
    ) : url ? (
      <Card 
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-md"
        onClick={onExpand}
      >
        <CardContent className="p-0 relative">
          <img
            src={url}
            alt="Verification document"
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          <div className="absolute top-3 right-3 bg-background/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <Eye className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Document unavailable</span>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

export const VerifyRespondentModal: React.FC<VerifyRespondentModalProps> = ({
  respondent,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState(false);

  function extractS3Key(url: string): string {
    const AWS_BASE_URL = import.meta.env.VITE_AWS_BASE_URL;
    return url.startsWith(AWS_BASE_URL) ? url.replace(AWS_BASE_URL, "") : url;
  }

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (!respondent.verificationDocument) {
        setDocumentLoading(false);
        return;
      }

      try {
        const key = extractS3Key(respondent.verificationDocument);
        const res = await api.get(
          `${API_URL}/files/presign?key=${encodeURIComponent(key)}`
        );
        setImgUrl(res.data.url);
      } catch (err) {
        console.error("Failed to fetch presigned URL:", err);
        setImgUrl(null);
      } finally {
        setDocumentLoading(false);
      }
    };

    fetchPresignedUrl();
  }, [respondent]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(
        `${API_URL}/admin/responders/${respondent._id}/approve`,
        {}
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to approve respondent:", err);
      alert(err.response?.data?.message || "Failed to approve respondent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl sm:max-w-lg">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 space-y-0 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-lg font-bold">
                    Verify Respondent
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Review applicant details
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Application Status</span>
                  <StatusBadge status={respondent.status || "pending"} />
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <div className="space-y-3">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={respondent.fullName}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email Address"
                value={respondent.email}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Contact Number"
                value={respondent.contactNo ?? ''}
              />
            </div>

            {/* Notes */}
            {respondent.notes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  <p className="text-sm font-semibold">Additional Notes</p>
                </div>
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-800">{respondent.notes}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Verification Document */}
            <DocumentPreview
              title="Verification Document"
              url={imgUrl}
              loading={documentLoading}
              onExpand={() => setExpandedImage(true)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t bg-muted/50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading || documentLoading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Respondent
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Image Modal */}
      <Dialog open={expandedImage} onOpenChange={setExpandedImage}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedImage(false)}
              className="absolute top-4 right-4 z-10 bg-background/20 hover:bg-background/30 text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
            {imgUrl && (
              <img
                src={imgUrl}
                alt="Verification document"
                className="w-full h-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VerifyRespondentModal;