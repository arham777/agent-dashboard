import * as React from "react";

export const Slider = ({
  value = [0.5],
  onValueChange,
  min = 0.1,
  max = 1,
  step = 0.1,
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  );
};
