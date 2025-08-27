
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-500">Progresso</span>
        <span className="text-sm font-bold text-blue-600">{cappedProgress}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${cappedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
   