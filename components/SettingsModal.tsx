import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: number) => void;
  currentGoal: number;
  holidays: string[];
  onToggleHoliday: (date: string) => void;
  viewingDate: Date;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentGoal, holidays, onToggleHoliday, viewingDate }) => {
  const [goal, setGoal] = useState(currentGoal);
  const [calendarDate, setCalendarDate] = useState(viewingDate);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    if (isOpen) {
      setGoal(currentGoal);
      setCalendarDate(viewingDate); // Sync calendar to main view's date on open
    }
  }, [currentGoal, isOpen, viewingDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newGoal = Math.max(0, Math.min(999, Number(goal) || 0));
    onSave(newGoal);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const changeMonth = (offset: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));
  };

  const renderMiniCalendar = () => {
    const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    const startingDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`prev-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
      const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = date.getDay();

      const isDefaultHoliday = dayOfWeek === 0 || dayOfWeek === 1;
      const isToggled = holidays.includes(dateStr);
      const isHoliday = isDefaultHoliday ? !isToggled : isToggled;

      let dayClasses = "w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 text-sm";
      if (isHoliday) {
          dayClasses += " bg-red-200 text-red-800 font-bold";
      } else {
          dayClasses += " hover:bg-slate-100";
      }

      days.push(
        <div key={day} className={dayClasses} onClick={() => onToggleHoliday(dateStr)}>
          {day}
        </div>
      );
    }
    return days;
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
          <h3 className="text-lg font-bold text-slate-800">⚙️ 설정</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div>
          <label htmlFor="daily-goal" className="block text-sm font-medium text-slate-700 mb-2">
            🎯 월/일일목표량 (기본 190)
          </label>
          <input
            id="daily-goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="999"
            autoFocus
          />
        </div>

        <hr className="my-6"/>

        <div>
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">🗓️ 휴무일 관리 (클릭하여 추가/삭제)</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-slate-800">
                    {`${calendarDate.getFullYear()}년 ${calendarDate.getMonth() + 1}월`}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                    <ChevronRight size={18} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
                {daysOfWeek.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {renderMiniCalendar()}
            </div>
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

export default SettingsModal;