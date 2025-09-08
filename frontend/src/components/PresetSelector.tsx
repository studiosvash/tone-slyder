import React, { useState } from 'react';
import { DEFAULT_PRESETS, TonePreset } from '@tone-slyder/shared/types';
import { ChevronDown, BookOpen, Briefcase, MessageCircle, FileText, Star } from 'lucide-react';

interface PresetSelectorProps {
  onPresetApply: (preset: TonePreset) => void;
  disabled?: boolean;
  className?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onPresetApply,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TonePreset | null>(null);

  const handlePresetSelect = (preset: TonePreset) => {
    setSelectedPreset(preset);
    setIsOpen(false);
    onPresetApply(preset);
  };

  const getPresetIcon = (presetId: string) => {
    switch (presetId) {
      case 'business':
        return <Briefcase size={16} className="text-blue-600" />;
      case 'academic':
        return <BookOpen size={16} className="text-purple-600" />;
      case 'social':
        return <MessageCircle size={16} className="text-green-600" />;
      case 'editorial':
        return <FileText size={16} className="text-orange-600" />;
      default:
        return <Star size={16} className="text-gray-600" />;
    }
  };

  const getPresetColor = (presetId: string) => {
    switch (presetId) {
      case 'business':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'academic':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'social':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'editorial':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className={`preset-selector relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Quick Presets
      </label>

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <div className="flex items-center gap-3">
          {selectedPreset ? (
            <>
              {getPresetIcon(selectedPreset.id)}
              <div>
                <span className="font-medium text-gray-900">{selectedPreset.name}</span>
                <p className="text-xs text-gray-500 truncate max-w-xs">
                  {selectedPreset.description}
                </p>
              </div>
            </>
          ) : (
            <span className="text-gray-500">Select a preset...</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 space-y-1">
            {DEFAULT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getPresetColor(preset.id)}`}
              >
                {getPresetIcon(preset.id)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {preset.description}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-white bg-opacity-60 rounded-full text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider and Community Presets Link */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Open community presets modal
              }}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Browse Community Presets →
            </button>
          </div>
        </div>
      )}

      {/* Preset Values Preview */}
      {selectedPreset && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preset Values:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(selectedPreset.sliderValues).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize text-gray-600">{key}:</span>
                <span className="font-mono text-gray-900">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
