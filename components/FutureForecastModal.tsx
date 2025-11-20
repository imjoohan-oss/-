import React from 'react';
import { X, Loader } from 'lucide-react';

interface FutureForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  forecastHtml: string;
}

const FutureForecastModal: React.FC<FutureForecastModalProps> = ({ isOpen, onClose, isLoading, forecastHtml }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl m-4 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-lg font-bold text-slate-800">AI 미래 예측 리포트</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-600">
              <Loader className="animate-spin mb-4" size={32} />
              <p className="font-semibold">AI가 과거 데이터를 분석하여 미래를 예측하고 있습니다...</p>
              <p className="text-sm">잠시만 기다려주세요.</p>
            </div>
          ) : (
            <div
              className="prose prose-sm sm:prose-base max-w-none prose-h2:font-bold prose-h2:text-slate-800 prose-h3:font-semibold prose-h3:text-slate-700 prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: forecastHtml }}
            />
          )}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutureForecastModal;
