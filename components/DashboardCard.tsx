
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
