
import React from 'react';
import { BrainCircuit, Loader } from 'lucide-react';

interface InsightCardProps {
  onGenerate: () => void;
  isLoading: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center h-full">
      <BrainCircuit size={28} className="text-purple-500 mb-2" />
      <h3 className="text-sm font-medium text-slate-500 mb-2">AI 기반 분석</h3>
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-300 disabled:cursor-wait"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin mr-2" size={16} />
            분석 중...
          </>
        ) : (
          '인사이트 생성'
        )}
      </button>
    </div>
  );
};

export default InsightCard;
