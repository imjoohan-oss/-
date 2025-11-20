import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CountInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (count: number) => void;
  date: string;
  initialValue: number;
}

const CountInputModal: React.FC<CountInputModalProps> = ({ isOpen, onClose, onSave, date, initialValue }) => {
  const [count, setCount] = useState(initialValue);
  const [parsedDate, setParsedDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCount(initialValue);
      if (date) {
          const [y, m, d] = date.split('-');
          setParsedDate(`${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`);
      }
    }
  }, [initialValue, date, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(Number(count) || 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl m-4" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">{parsedDate}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        <div>
          <label htmlFor="shipment-count" className="block text-sm font-medium text-slate-700 mb-2">
            배송 완료 건수 (0 입력 시 삭제)
          </label>
          <input
            id="shipment-count"
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition-colors">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountInputModal;
