import React, { useState, useCallback } from 'react';
import { SliderConfig } from '../types/shared';
import { HelpCircle } from 'lucide-react';

interface SliderProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  config,
  value,
  onChange,
  disabled = false,
  showValue = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    onChange(newValue);
  }, [onChange]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getValueLabel = (val: number): string => {
    if (val <= 20) return 'Very Low';
    if (val <= 40) return 'Low';
    if (val <= 60) return 'Moderate';
    if (val <= 80) return 'High';
    return 'Very High';
  };

  const getSliderStyle = () => {
    const percentage = ((value - config.min) / (config.max - config.min)) * 100;
    return {
      background: `linear-gradient(to right, 
        #3b82f6 0%, 
        #3b82f6 ${percentage}%, 
        #e5e7eb ${percentage}%, 
        #e5e7eb 100%)`
    };
  };

  return (
    <div className={`slider-container ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label 
            htmlFor={config.id}
            className={`text-sm font-medium ${config.isCore ? 'text-gray-900' : 'text-gray-700'}`}
          >
            {config.isCore && <span className="text-blue-600">●</span>} {config.label}
          </label>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <HelpCircle size={14} />
          </button>
        </div>
        {showValue && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 min-w-[60px] text-right">
              {getValueLabel(value)}
            </span>
            <span className={`text-sm font-mono min-w-[35px] text-right transition-colors duration-200 ${
              isDragging ? 'text-blue-600 font-bold' : 'text-gray-600'
            }`}>
              {value}%
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="range"
          id={config.id}
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className={`slider-input w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-y-110'
          }`}
          style={getSliderStyle()}
        />

        {/* Custom thumb styling via CSS */}
        <style jsx>{`
          .slider-input::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: ${isDragging ? '#2563eb' : '#3b82f6'};
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            transform: ${isDragging ? 'scale(1.2)' : 'scale(1)'};
          }
          
          .slider-input::-moz-range-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: ${isDragging ? '#2563eb' : '#3b82f6'};
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            transform: ${isDragging ? 'scale(1.2)' : 'scale(1)'};
          }
          
          .slider-input:disabled::-webkit-slider-thumb {
            background: #9ca3af;
            cursor: not-allowed;
          }
          
          .slider-input:disabled::-moz-range-thumb {
            background: #9ca3af;
            cursor: not-allowed;
          }
        `}</style>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 mt-1 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
          {config.description}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Range labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

// Specialized component for core sliders
export const CoreSlider: React.FC<Omit<SliderProps, 'config'> & { 
  sliderId: keyof typeof import('../types/shared').CORE_SLIDERS 
}> = ({ sliderId, ...props }) => {
  const config = import('../types/shared').CORE_SLIDERS[sliderId];
  return <Slider config={config} {...props} />;
};
