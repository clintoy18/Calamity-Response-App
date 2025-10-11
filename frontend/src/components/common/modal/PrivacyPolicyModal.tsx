import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, Eye, Database, UserCheck, AlertCircle, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: [
        'Location data when you request emergency assistance',
        'Device information and unique identifiers',
        'Emergency contact information you provide',
        'Communication logs during emergency responses',
        'Account information (name, email, phone number)',
      ],
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: [
        'To provide emergency response services',
        'To connect you with nearby responders',
        'To improve our emergency response system',
        'To comply with legal obligations',
        'To maintain security and prevent fraud',
      ],
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'We use encryption to protect your data in transit and at rest',
        'Access to personal information is restricted to authorized personnel',
        'Regular security audits and updates are performed',
        'Your location data is only shared during active emergencies',
        'We comply with Philippine Data Privacy Act of 2012',
      ],
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content: [
        'Emergency responders receive your location during active emergencies',
        'Local government agencies may access emergency data',
        'We never sell your personal information to third parties',
        'Data is shared only when necessary for emergency response',
        'Anonymous, aggregated data may be used for public safety research',
      ],
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access and review your personal information',
        'Request correction of inaccurate data',
        'Request deletion of your account and data',
        'Opt-out of non-emergency communications',
        'Lodge complaints with the National Privacy Commission',
      ],
    },
    {
      icon: FileText,
      title: 'Data Retention',
      content: [
        'Emergency incident data is retained for 2 years for legal compliance',
        'Account information is kept while your account is active',
        'Location history is automatically deleted after 90 days',
        'You can request immediate deletion of non-essential data',
        'Backup data is securely erased after 30 days',
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-surface rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-strong overflow-hidden border border-border/30 flex flex-col"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/30 bg-gradient-to-br from-brand/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center shadow-soft">
                    <Shield size={28} className="text-brand" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-text">Privacy Policy</h2>
                    <p className="text-sm text-text-muted mt-1">Cebu Calamity App • Last updated: October 2025</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-11 h-11 rounded-xl hover:bg-background flex items-center justify-center transition-all duration-150 hover:rotate-90"
                  aria-label="Close privacy policy"
                >
                  <X size={22} className="text-text-muted" />
                </button>
              </div>
            </div>

            {/* Introduction */}
            <div className="p-6 border-b border-border/30 bg-background/50">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-action mt-0.5 flex-shrink-0" />
                <div className="text-sm text-text leading-relaxed">
                  <p className="font-semibold mb-2">Your Privacy Matters</p>
                  <p className="text-text-muted">
                    This Privacy Policy explains how the Cebu Calamity App collects, uses, and protects your personal information. 
                    By using our emergency response services, you agree to the terms outlined below. We are committed to protecting 
                    your privacy while ensuring effective emergency response in compliance with the{' '}
                    <span className="font-medium text-text">Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-background/50 rounded-2xl p-5 border border-border/30 hover:border-border/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-action/20 to-action/10 flex items-center justify-center flex-shrink-0 shadow-soft">
                      <section.icon size={24} className="text-action" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-bold text-text mb-3">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <div className="w-1.5 h-1.5 rounded-full bg-action mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Contact Section */}
              <div className="bg-gradient-to-br from-brand/5 to-transparent rounded-2xl p-5 border border-border/30">
                <h3 className="text-lg font-heading font-bold text-text mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-brand" />
                  Contact Us
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  If you have questions about this Privacy Policy or wish to exercise your data rights, please contact:
                </p>
                <div className="bg-surface rounded-xl p-4 border border-border/50 space-y-2 text-sm">
                  <p className="text-text font-medium">Cebu City Government - Data Protection Officer</p>
                  <p className="text-text-muted">Email: dpo@cebu.gov.ph</p>
                  <p className="text-text-muted">Address: Cebu City Hall, Cebu City, Philippines</p>
                  <p className="text-text-muted">Phone: (032) XXX-XXXX</p>
                </div>
              </div>

              {/* Compliance Note */}
              <div className="bg-background/50 rounded-2xl p-5 border border-border/30">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-success mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-text-muted leading-relaxed">
                    <p className="font-semibold text-text mb-1">Compliance & Transparency</p>
                    <p>
                      This application is developed in compliance with Philippine laws including RA 10173 (Data Privacy Act), 
                      RA 10175 (Cybercrime Prevention Act), and relevant local government regulations. We are committed to 
                      transparency and protecting your rights while providing critical emergency services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border/30 bg-gradient-to-br from-background/50 to-transparent">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-text-muted">
                  By continuing to use this app, you acknowledge that you have read and understood this Privacy Policy.
                </p>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-background text-sm font-medium text-text transition-all duration-150"
                  >
                    Close
                  </button>
                  {onAccept && (
                    <button
                      onClick={() => {
                        onAccept();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-action hover:bg-action-dark text-white text-sm font-semibold shadow-soft hover:shadow-medium transition-all duration-150"
                    >
                      Accept & Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};