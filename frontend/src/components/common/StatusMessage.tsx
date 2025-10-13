  import React from 'react';
  import { motion } from 'framer-motion';
  import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

  interface ButtonProps {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'disabled';
  }

  interface StatusMessageProps {
    state: 'success' | 'error' | 'loading';
    message?: string;
    hasLocation?: boolean; // for error/loading to control button states/text
    buttons?: ButtonProps[];
  }

  const iconMap = {
    success: <CheckCircle className="w-10 h-10 text-brand" />,
    error: <AlertCircle className="w-10 h-10 text-emergency" />,
    loading: <Loader className="w-12 h-12 text-brand animate-spin" />,
  };

  const titleMap = {
    success: 'Request Submitted!',
    error: 'Error',
    loading: 'Loading...',
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  export const StatusMessage: React.FC<StatusMessageProps> = ({
    state,
    message,
    hasLocation = true,
    buttons = [],
  }) => {
    const icon = iconMap[state];
    const title = titleMap[state];

    return (
      <motion.div
        className="p-6 text-center bg-surface rounded-xl max-w-sm mx-auto shadow-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.25 }}
      >
        <div className="w-16 h-16 rounded-full bg-map flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="font-heading text-xl text-text mb-2">{title}</h3>
        {state === 'error' && !hasLocation && (
          <p className="text-sm text-emergency mb-6">Please enable location services.</p>
        )}
        {message && <p className={`text-sm mb-6 ${state === 'error' ? 'text-emergency' : 'text-text-muted'}`}>{message}</p>}
        <div className="space-y-3">
          {buttons.map(({ text, onClick, variant = 'primary' }, i) => (
            <button
              key={i}
              onClick={onClick}
              disabled={variant === 'disabled'}
              className={`w-full py-2.5 px-6 rounded-lg font-alt transition
                ${
                  variant === 'primary'
                    ? 'bg-brand text-white hover:bg-brand-dark'
                    : variant === 'secondary'
                    ? 'bg-map text-text hover:bg-border-strong'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {text}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };
