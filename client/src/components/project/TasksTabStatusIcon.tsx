
import React from 'react';

interface TasksTabStatusIconProps {
  status: string;
}

const TasksTabStatusIcon = ({ status }: TasksTabStatusIconProps) => {
  const baseClasses = "w-4 h-4 rounded-full border-2 flex items-center justify-center";
  
  switch (status) {
    case 'redline':
      return (
        <div className={`${baseClasses} border-red-500 bg-red-500`}>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      );
    case 'progress':
      return (
        <div className={`${baseClasses} border-blue-500 bg-blue-500`}>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      );
    case 'completed':
      return (
        <div className={`${baseClasses} border-green-500 bg-green-500`}>
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} border-gray-300`}></div>
      );
  }
};

export default TasksTabStatusIcon;
