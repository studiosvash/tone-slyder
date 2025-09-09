import React, { useState, useCallback, useEffect } from 'react';
import { SliderPanel } from './components/SliderPanel';
import { CORE_SLIDERS, CoreSliders, TonePreset, CustomSlider } from './types/shared';
import { Send, RotateCcw, Loader, CheckCircle, AlertCircle, Save, History } from 'lucide-react';
import axios from 'axios';
import { useLocalStorage, useAutoSave, useRecentItems, useUserPreferences } from './hooks/useLocalStorage';

interface RewriteResponse {
  rewrittenText: string;
  originalText: string;
  model: string;
  processingTime: number;
  tokensUsed: number;
  guardrailViolations?: string[];
}

function App() {
  // User preferences with localStorage persistence
  const { preferences, updatePreference } = useUserPreferences();
  
  // Core slider states with localStorage persistence
  const [coreValues, setCoreValues] = useLocalStorage<CoreSliders>(
    'tone-slyder-slider-values',
    preferences.defaultSliderValues || {
      formality: CORE_SLIDERS.formality.defaultValue,
      conversational: CORE_SLIDERS.conversational.defaultValue,
      informativeness: CORE_SLIDERS.informativeness.defaultValue,
      authoritativeness: CORE_SLIDERS.authoritativeness.defaultValue
    }
  );

  // Custom sliders with localStorage
  const [customSliders] = useState<CustomSlider[]>([]);
  const [customValues, setCustomValues] = useLocalStorage<Record<string, number>>(
    'tone-slyder-custom-values',
    {}
  );

  // Text content with localStorage persistence and auto-save
  const [originalText, setOriginalText] = useLocalStorage('tone-slyder-draft-text', '');
  const [rewrittenText, setRewrittenText] = useState('');

  // Guardrails with localStorage persistence
  const [requiredWords, setRequiredWords] = useLocalStorage('tone-slyder-required-words', '');
  const [bannedWords, setBannedWords] = useLocalStorage('tone-slyder-banned-words', '');

  // Recent slider combinations for quick access
  const [recentCombinations, addRecentCombination] = useRecentItems<{
    name: string;
    sliderValues: CoreSliders;
    timestamp: number;
  }>('tone-slyder-recent-combinations', 5);

  // Auto-save text content every 2 seconds
  useAutoSave('tone-slyder-draft-text', originalText, 2000);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showRecentCombinations, setShowRecentCombinations] = useState(false);

  const handleCoreSliderChange = useCallback((sliderId: keyof CoreSliders, value: number) => {
    setCoreValues(prev => ({
      ...prev,
      [sliderId]: value
    }));
  }, []);

  const handleCustomSliderChange = useCallback((sliderId: string, value: number) => {
    // Implementation for custom sliders
    console.log('Custom slider change:', sliderId, value);
  }, []);

  const handlePresetApply = useCallback((preset: TonePreset) => {
    // Apply preset values to sliders
    Object.entries(preset.sliderValues).forEach(([key, value]) => {
      if (key in coreValues) {
        setCoreValues(prev => ({
          ...prev,
          [key as keyof CoreSliders]: value
        }));
      }
    });
  }, [coreValues]);

  const handleResetSliders = useCallback(() => {
    const defaultValues = {
      formality: CORE_SLIDERS.formality.defaultValue,
      conversational: CORE_SLIDERS.conversational.defaultValue,
      informativeness: CORE_SLIDERS.informativeness.defaultValue,
      authoritativeness: CORE_SLIDERS.authoritativeness.defaultValue
    };
    setCoreValues(defaultValues);
  }, [setCoreValues]);

  const handleSaveCurrentCombination = useCallback(() => {
    const combination = {
      name: `Combination ${new Date().toLocaleString()}`,
      sliderValues: coreValues,
      timestamp: Date.now()
    };
    addRecentCombination(combination);
  }, [coreValues, addRecentCombination]);

  const handleLoadRecentCombination = useCallback((combination: {
    name: string;
    sliderValues: CoreSliders;
    timestamp: number;
  }) => {
    setCoreValues(combination.sliderValues);
    setShowRecentCombinations(false);
  }, [setCoreValues]);

  const handleAddCustomSlider = useCallback(() => {
    // TODO: Implement custom slider creation
    console.log('Add custom slider');
  }, []);

  const handleManageSliders = useCallback(() => {
    // TODO: Implement slider management
    console.log('Manage sliders');
  }, []);

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      setError('Please enter some text to rewrite.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post<{ success: boolean; data: RewriteResponse }>('http://localhost:3001/api/rewrite', {
        originalText: originalText.trim(),
        sliderValues: {
          ...coreValues,
          ...customValues
        },
        guardrails: {
          required: requiredWords ? requiredWords.split(',').map(w => w.trim()) : [],
          banned: bannedWords ? bannedWords.split(',').map(w => w.trim()) : []
        }
      });

      if (response.data.success) {
        setRewrittenText(response.data.data.rewrittenText);
        setSuccess(true);
        
        // Auto-save successful combination for quick access
        const successfulCombination = {
          name: `Successful - ${new Date().toLocaleTimeString()}`,
          sliderValues: coreValues,
          timestamp: Date.now()
        };
        addRecentCombination(successfulCombination);
        
        if (response.data.data.guardrailViolations && response.data.data.guardrailViolations.length > 0) {
          setError(`Warning: ${response.data.data.guardrailViolations.join(', ')}`);
        }
      } else {
        throw new Error('Rewrite failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while rewriting.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎚️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tone Slyder</h1>
                <p className="text-sm text-gray-500">AI-powered tone adjustment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {originalText && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  📝 Draft saved
                </span>
              )}
              <button
                onClick={handleSaveCurrentCombination}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
                title="Save current slider combination"
              >
                <Save size={14} />
                Save
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowRecentCombinations(!showRecentCombinations)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
                  title="Recent combinations"
                >
                  <History size={14} />
                  Recent ({recentCombinations.length})
                </button>
                {showRecentCombinations && recentCombinations.length > 0 && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-2 border-b">
                      <h4 className="text-sm font-medium text-gray-900">Recent Combinations</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {recentCombinations.map((combination, index) => (
                        <button
                          key={index}
                          onClick={() => handleLoadRecentCombination(combination)}
                          className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {combination.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            F:{combination.sliderValues.formality} C:{combination.sliderValues.conversational} I:{combination.sliderValues.informativeness} A:{combination.sliderValues.authoritativeness}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Text Editor */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Text Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Original Text</h2>
                <span className="text-sm text-gray-500">
                  {originalText.length} characters
                </span>
              </div>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Enter your text here to adjust its tone..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Guardrails */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardrails</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Words (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={requiredWords}
                    onChange={(e) => setRequiredWords(e.target.value)}
                    placeholder="amazing, important, key"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banned Words (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={bannedWords}
                    onChange={(e) => setBannedWords(e.target.value)}
                    placeholder="terrible, awful, bad"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Rewrite Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRewrite}
                disabled={isLoading || !originalText.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Apply Tone Adjustment
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle size={18} />
                Tone adjustment completed successfully!
              </div>
            )}

            {/* Results */}
            {rewrittenText && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Rewritten Text</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {rewrittenText.length} characters
                    </span>
                    <button
                      onClick={() => copyToClipboard(rewrittenText)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg min-h-[12rem] whitespace-pre-wrap">
                  {rewrittenText}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Controls */}
          <div className="lg:col-span-1">
            <SliderPanel
              coreValues={coreValues}
              customSliders={customSliders}
              customValues={customValues}
              onCoreSliderChange={handleCoreSliderChange}
              onCustomSliderChange={handleCustomSliderChange}
              onPresetApply={handlePresetApply}
              onResetSliders={handleResetSliders}
              onAddCustomSlider={handleAddCustomSlider}
              onManageSliders={handleManageSliders}
              disabled={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
