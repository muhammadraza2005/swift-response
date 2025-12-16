'use client';

import { useState } from 'react';
import { Bot, X, Loader2, Sparkles } from 'lucide-react';

interface AIAssistantButtonProps {
  emergencyType: string;
  description: string;
  mode: 'self-help' | 'helper';
}

export default function AIAssistantButton({ emergencyType, description, mode }: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchSuggestion = async () => {
    setLoading(true);
    setError('');
    setSuggestion('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyType,
          description,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!suggestion && !loading) {
      fetchSuggestion();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        aria-label="Get AI Assistance"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm">AI Assistant</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Emergency Assistant</h3>
                    <p className="text-sm opacity-90">
                      {mode === 'self-help' ? 'What you should do' : 'How to help effectively'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Emergency Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    {emergencyType}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{description}</p>
              </div>

              {/* AI Suggestion */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600">Generating AI suggestion...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 font-semibold mb-2">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={fetchSuggestion}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {suggestion && !loading && (
                <div className="prose prose-sm max-w-none">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <h4 className="text-purple-900 font-bold text-base m-0">AI Recommendation</h4>
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {suggestion}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 m-0">
                      <strong>Disclaimer:</strong> This is AI-generated advice. Always prioritize calling emergency services (Rescue 1122 in Pakistan) for serious emergencies.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {suggestion && (
                <button
                  onClick={fetchSuggestion}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
