import React, { useState } from 'react';
import { cn } from '../../../libs/utils'; // Assuming cn utility is available

const ToggleSwitch = ({ label, enabled, setEnabled, switchId }) => {
  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={switchId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        type="button"
        id={switchId}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
          enabled ? 'bg-indigo-600' : 'bg-gray-300'
        )}
        aria-pressed={enabled}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch; 