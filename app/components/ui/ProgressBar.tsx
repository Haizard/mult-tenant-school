import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
}

const ProgressBar = ({ progress, colorClass = 'bg-purple-500' }: ProgressBarProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${colorClass}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
