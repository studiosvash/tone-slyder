import React, { useCallback } from 'react';
import { Slider } from './Slider';
import { PresetSelector } from './PresetSelector';
import { CORE_SLIDERS, CoreSliders, CustomSlider, TonePreset } from '../types/shared';
import { RotateCcw, Plus, Settings } from 'lucide-react';

interface SliderPanelProps {
  coreValues: CoreSliders;
  customSliders: CustomSlider[];
  customValues: Record<string, number>;
  onCoreSliderChange: (sliderId: keyof CoreSliders, value: number) => void;
  onCustomSliderChange: (sliderId: string, value: number) => void;
  onPresetApply: (preset: TonePreset) => void;
  onResetSliders: () => void;
  onAddCustomSlider: () => void;
  onManageSliders: () => void;
  disabled?: boolean;
  className?: string;
}

export const SliderPanel: React.FC<SliderPanelProps> = ({
  coreValues,
  customSliders,
  customValues,
  onCoreSliderChange,
  onCustomSliderChange,
  onPresetApply,
  onResetSliders,
  onAddCustomSlider,
  onManageSliders,
  disabled = false,
  className = ''
}) => {
  const handleCoreSliderChange = useCallback((sliderId: keyof CoreSliders) => {
    return (value: number) => {
      onCoreSliderChange(sliderId, value);
    };
  }, [onCoreSliderChange]);

  const handleCustomSliderChange = useCallback((sliderId: string) => {
    return (value: number) => {
      onCustomSliderChange(sliderId, value);
    };
  }, [onCustomSliderChange]);

  const isSlidersDirty = useCallback(() => {
    // Check if any core slider is not at default value
    const coreIsDirty = Object.entries(coreValues).some(([key, value]) => {
      const config = CORE_SLIDERS[key as keyof CoreSliders];
      return value !== config.defaultValue;
    });

    // Check if any custom slider is not at default value
    const customIsDirty = customSliders.some(slider => {
      const value = customValues[slider.id] || slider.defaultValue;
      return value !== slider.defaultValue;
    });

    return coreIsDirty || customIsDirty;
  }, [coreValues, customSliders, customValues]);

  return (
    <div className={`slider-panel bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header with presets and controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tone Controls</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetSliders}
            disabled={disabled || !isSlidersDirty()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset all sliders to default values"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={onManageSliders}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Manage custom sliders"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <PresetSelector
          onPresetApply={onPresetApply}
          disabled={disabled}
        />
      </div>

      {/* Core Sliders */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-800">Core Tone Dimensions</h3>
          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
            ● Core
          </span>
        </div>
        
        <div className="grid gap-6">
          {Object.entries(CORE_SLIDERS).map(([key, config]) => (
            <Slider
              key={config.id}
              config={config}
              value={coreValues[key as keyof CoreSliders]}
              onChange={handleCoreSliderChange(key as keyof CoreSliders)}
              disabled={disabled}
              className="bg-blue-50/30 p-4 rounded-lg border border-blue-100"
            />
          ))}
        </div>
      </div>

      {/* Custom Sliders */}
      {customSliders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-800">Custom Tone Dimensions</h3>
            <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">
              {customSliders.length} Custom
            </span>
          </div>
          
          <div className="grid gap-4">
            {customSliders.map(slider => (
              <Slider
                key={slider.id}
                config={slider}
                value={customValues[slider.id] || slider.defaultValue}
                onChange={handleCustomSliderChange(slider.id)}
                disabled={disabled}
                className="bg-green-50/30 p-4 rounded-lg border border-green-100"
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Slider Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onAddCustomSlider}
          disabled={disabled}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={16} />
          Add Custom Slider
        </button>
      </div>

      {/* Slider Status */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {Object.keys(coreValues).length + customSliders.length} sliders active
        </span>
        {isSlidersDirty() && (
          <span className="text-blue-600 font-medium">
            Modified from defaults
          </span>
        )}
      </div>
    </div>
  );
};
