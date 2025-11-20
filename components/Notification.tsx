import React, { useEffect } from 'react';
import { XCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up" role="alert">
      <div className="max-w-sm bg-red-600 text-white rounded-lg shadow-lg flex items-center p-4">
        <XCircle size={20} className="mr-3 flex-shrink-0" />
        <p className="text-sm font-medium flex-grow">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 -mr-1 p-1 rounded-full hover:bg-red-700 transition-colors"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
