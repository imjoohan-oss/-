import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Settings, CheckCircle2 } from 'lucide-react';
import CountInputModal from './CountInputModal';
import SettingsModal from './SettingsModal';

interface CalendarViewProps {
  dailyCounts: { [date: string]: number };
  onCountUpdate: (date: string, count: number) => void;
  monthlyGoals: { [month: string]: number };
  onGoalUpdate: (month: string, newGoal: number) => void;
  holidays: string[];
  onToggleHoliday: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ dailyCounts, onCountUpdate, monthlyGoals, onGoalUpdate, holidays, onToggleHoliday }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [countModalState, setCountModalState] = useState({ isOpen: false, date: '', initialValue: 0 });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  
  const currentMonthStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const dailyGoal = monthlyGoals[currentMonthStr] ?? 190;

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dateStr: string) => {
    setCountModalState({ isOpen: true, date: dateStr, initialValue: dailyCounts[dateStr] || 0 });
  };
  
  const handleCountModalClose = () => {
    setCountModalState({ isOpen: false, date: '', initialValue: 0 });
  };
  
  const handleCountModalSave = (count: number) => {
    onCountUpdate(countModalState.date, count);
    handleCountModalClose();
  };

  const handleSettingsSave = (newGoal: number) => {
    onGoalUpdate(currentMonthStr, newGoal);
    setIsSettingsModalOpen(false);
  }

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startingDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`prev-${i}`} className="w-full h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = date.getDay();

      const isToday = date.toDateString() === today.toDateString();
      const count = dailyCounts[dateStr];

      const isDefaultHoliday = dayOfWeek === 0 || dayOfWeek === 1;
      const isToggled = holidays.includes(dateStr);
      const isHoliday = isDefaultHoliday ? !isToggled : isToggled;

      let dayClasses = "w-full h-12 flex items-center justify-center rounded-lg transition-all duration-200 relative text-sm";
      let dayContent;

      if (isHoliday) {
          dayClasses += " bg-slate-200 text-slate-500 line-through flex-col cursor-not-allowed";
          dayContent = (
              <>
                  <span className="text-xs">{day}</span>
                  <span className="text-xs font-medium">휴무</span>
              </>
          );
      } else {
          dayClasses += " cursor-pointer";
          if (count > 0) {
              const goalMet = count >= dailyGoal && dailyGoal > 0;
              dayClasses += " bg-emerald-500 text-white font-bold hover:bg-emerald-600 flex-col shadow-md";
              dayContent = (
                  <>
                      {goalMet && <CheckCircle2 size={16} className="absolute top-1 right-1 opacity-80" />}
                      <span className="text-xs -mb-1">{day}</span>
                      <span className="text-lg">{count}</span>
                  </>
              );
          } else {
              dayClasses += isToday ? " bg-blue-100 text-blue-700 font-bold hover:bg-blue-200" : " hover:bg-slate-100";
              dayContent = <span>{day}</span>;
          }
      }

      days.push(
        <div 
          key={day} 
          className={dayClasses} 
          onClick={() => {
            if (!isHoliday) {
              handleDayClick(dateStr)
            }
          }}
        >
          {dayContent}
        </div>
      );
    }
    return days;
  }, [currentDate, dailyCounts, holidays, dailyGoal, onToggleHoliday]);

  const monthlyStats = useMemo(() => {
    let totalWorkingDays = 0;
    let currentTotalAchieved = 0;
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = date.getDay();
        
        const isDefaultHoliday = dayOfWeek === 0 || dayOfWeek === 1;
        const isToggled = holidays.includes(dateStr);
        const isHoliday = isDefaultHoliday ? !isToggled : isToggled;

        if (!isHoliday) {
            totalWorkingDays++;
        }

        if (dailyCounts[dateStr]) {
            currentTotalAchieved += dailyCounts[dateStr];
        }
    }

    const monthlyTotalGoal = dailyGoal * totalWorkingDays;
    const progressPercentage = monthlyTotalGoal > 0 ? Math.round((currentTotalAchieved / monthlyTotalGoal) * 100) : 0;
    const remainingCount = monthlyTotalGoal - currentTotalAchieved;

    return { totalWorkingDays, monthlyTotalGoal, currentTotalAchieved, progressPercentage, remainingCount };
  }, [currentDate, dailyCounts, holidays, dailyGoal]);

  const weeklyStats = useMemo(() => {
    const weeksData: { weekNumber: number; total: number; goal: number; achievement: number; isPast: boolean; }[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison

    let weekNumber = 1;
    let weeklyTotal = 0;
    let weeklyWorkingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = date.getDay();

        const isDefaultHoliday = dayOfWeek === 0 || dayOfWeek === 1;
        const isToggled = holidays.includes(dateStr);
        const isHoliday = isDefaultHoliday ? !isToggled : isToggled;

        if (!isHoliday) {
            weeklyWorkingDays++;
            weeklyTotal += dailyCounts[dateStr] || 0;
        }

        // End of a week (Saturday) or end of the month
        if (dayOfWeek === 6 || day === daysInMonth) {
            if (weeklyWorkingDays > 0) { // Process week if it had at least one working day
                const weeklyGoal = dailyGoal * weeklyWorkingDays;
                const achievement = weeklyGoal > 0 ? Math.round((weeklyTotal / weeklyGoal) * 100) : 0;
                
                // A week is considered "past" if its last day is before today
                const isPast = date < today;

                weeksData.push({
                    weekNumber,
                    total: weeklyTotal,
                    goal: weeklyGoal,
                    achievement,
                    isPast,
                });
            }
            // Reset for the next week
            weekNumber++;
            weeklyTotal = 0;
            weeklyWorkingDays = 0;
        }
    }

    return weeksData;
  }, [currentDate, dailyCounts, holidays, dailyGoal]);

  const { totalWorkingDays, monthlyTotalGoal, currentTotalAchieved, progressPercentage, remainingCount } = monthlyStats;

  return (
    <>
      <CountInputModal 
        isOpen={countModalState.isOpen}
        onClose={handleCountModalClose}
        onSave={handleCountModalSave}
        date={countModalState.date}
        initialValue={countModalState.initialValue}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSettingsSave}
        currentGoal={dailyGoal}
        holidays={holidays}
        onToggleHoliday={onToggleHoliday}
        viewingDate={currentDate}
      />
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mx-2 w-36 text-center tabular-nums">
              {`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={goToToday} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded-md hover:bg-blue-50">오늘</button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 font-medium mb-2">
          {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>

        {weeklyStats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-3">🗓️ 주간별 요약</h3>
            <div className="space-y-2">
              {weeklyStats.map(({ weekNumber, total, goal, achievement, isPast }, index) => {
                const difference = total - goal;
                const isSurplus = difference >= 0;

                if (isPast) {
                  return (
                    <div key={weekNumber} className={`text-sm p-2 rounded-lg flex justify-between items-center ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                      <span className="font-semibold text-slate-500">{weekNumber}주차 (완료)</span>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                          difference === 0 
                            ? 'bg-green-100 text-green-800'
                            : isSurplus 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {difference === 0 
                            ? '목표 달성' 
                            : isSurplus 
                            ? `초과 ${difference.toLocaleString()}` 
                            : `미달 ${Math.abs(difference).toLocaleString()}`}
                        </span>
                        <span className="font-medium text-slate-600 tabular-nums">
                          <span className={`font-bold ${isSurplus ? 'text-red-600' : 'text-blue-700'}`}>{total.toLocaleString()}</span>
                          <span className="text-slate-500"> / {goal.toLocaleString()}개</span>
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={weekNumber} className={`text-sm p-2 rounded-lg ${index % 2 === 0 ? 'bg-slate-50' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="w-1/4 text-left">
                        <span className="font-semibold text-slate-700">{weekNumber}주차</span>
                      </div>
                      <div className="w-2/4 text-center">
                        {total > 0 && difference !== 0 && (
                          <span className={`text-lg font-bold ${isSurplus ? 'text-red-500' : 'text-green-600'}`}>
                            {isSurplus ? '초과' : '미달'} {Math.abs(difference).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="w-1/4 text-right">
                        <span className="font-medium text-slate-600">
                            <span className={`font-bold ${total >= goal ? 'text-red-500' : 'text-blue-600'}`}>{total.toLocaleString()}</span> / {goal.toLocaleString()}개
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={achievement} aria-valuemin={0} aria-valuemax={100}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(achievement, 100)}%`,
                          background: '#3b82f6'
                        }}
                      ></div>
                      {achievement > 100 && (
                        <div 
                          className="h-2 rounded-full transition-all duration-500 ease-out -mt-2"
                          style={{
                            width: `${achievement}%`,
                            background: `linear-gradient(to right, #3b82f6 ${100 / achievement * 100}%, #ef4444 ${100 / achievement * 100}%)`
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center text-center">
        {remainingCount > 0 ? (
            <p className="text-sm font-semibold text-indigo-800">
                🏁 총 남은 개수: <span className="font-bold text-lg">{remainingCount.toLocaleString()}</span>개
            </p>
        ) : (
            <p className="text-sm font-semibold text-emerald-800">
                🎉 월간 목표 달성 완료! ({Math.abs(remainingCount).toLocaleString()}개 초과)
            </p>
        )}
        </div>


        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-3">📊 월간 달성 현황</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">🏃‍♂️ 총 근무일수</span>
                    <span className="font-semibold">{totalWorkingDays}일</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">🎯 월 목표 총합계 (목표 {dailyGoal}개/일)</span>
                    <span className="font-semibold">{monthlyTotalGoal.toLocaleString()}개</span>
                </div>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                📦 현재 달성 현황
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                                {currentTotalAchieved.toLocaleString()} / {monthlyTotalGoal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default CalendarView;