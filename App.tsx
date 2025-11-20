import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import { AppData } from './types';

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData>({ dailyCounts: {}, monthlyGoals: {}, holidays: [] });

  // Load data from local storage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('shipmentAppData');
    if (savedData) {
      try {
        setAppData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }
  }, []);

  // Save data to local storage whenever it changes
  const handleDataUpdate = (newAppData: AppData) => {
    setAppData(newAppData);
    localStorage.setItem('shipmentAppData', JSON.stringify(newAppData));
  };

  const handleCountUpdate = (date: string, count: number) => {
    const newCounts = { ...appData.dailyCounts };
    if (count > 0) {
      newCounts[date] = count;
    } else {
      delete newCounts[date];
    }
    handleDataUpdate({
      ...appData,
      dailyCounts: newCounts,
    });
  };

  const handleGoalUpdate = (month: string, newGoal: number) => {
    handleDataUpdate({
      ...appData,
      monthlyGoals: {
        ...appData.monthlyGoals,
        [month]: newGoal,
      },
    });
  };

  const handleToggleHoliday = (date: string) => {
    const newHolidays = new Set(appData.holidays);
    if (newHolidays.has(date)) {
      newHolidays.delete(date);
    } else {
      newHolidays.add(date);
    }
    handleDataUpdate({ ...appData, holidays: Array.from(newHolidays).sort() });
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <CalendarView
          dailyCounts={appData.dailyCounts}
          onCountUpdate={handleCountUpdate}
          monthlyGoals={appData.monthlyGoals}
          onGoalUpdate={handleGoalUpdate}
          holidays={appData.holidays}
          onToggleHoliday={handleToggleHoliday}
        />
      </main>
    </div>
  );
};

export default App;