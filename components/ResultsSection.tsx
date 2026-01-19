import React, { useState } from 'react';

interface ResultsSectionProps {
  results: any;
  onOptimize: (level: 'honest' | 'aggressive') => void;
  onSkip: () => void;
}

export default function ResultsSection({ results, onOptimize, onSkip }: ResultsSectionProps) {
  const [showOptimizeOptions, setShowOptimizeOptions] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 45) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 65) return 'bg-blue-50 border-blue-200';
    if (score >= 45) return 'bg-yellow-50 border-yellow-200';
    if (score >= 30) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Main Score Card */}
      <div className={`rounded-2xl shadow-xl p-8 border-2 ${getScoreBgColor(results.interviewChance)}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Interview Chance</h2>
          <div className={`text-7xl font-bold mb-4 ${getScoreColor(results.interviewChance)}`}>
            {results.interviewChance}%
          </div>
          <div className="inline-block px-6 py-2 bg-white rounded-full shadow-sm">
            <p className="text-lg font-semibold text-gray-800">
              {results.recommendation.level}
            </p>
          </div>
          <p className="mt-4 text-gray-700">
            {results.recommendation.message}
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Keyword Matching</p>
            <p className="text-3xl font-bold text-blue-600">{results.breakdown.keywordScore}%</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">AI Analysis</p>
            <p className="text-3xl font-bold text-purple-600">{results.breakdown.aiScore}%</p>
          </div>
        </div>
      </div>

      {/* Detailed Aspects */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Analysis</h3>
        <div className="space-y-4">
          {Object.entries(results.aspects).map(([key, aspect]: [string, any]) => (
            <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className={`text-2xl font-bold ${getScoreColor(aspect.score)}`}>
                  {aspect.score}%
                </span>
              </div>
              <p className="text-sm text-gray-600">{aspect.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {results.strengths.map((strength: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
          <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {results.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-sm text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">AI Summary</h3>
        <p className="text-gray-700 leading-relaxed">{results.summary}</p>
      </div>

      {/* Optimize CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
        {!showOptimizeOptions ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Want to Improve Your Chances?</h3>
            <p className="mb-6">
              Generate an AI-optimized version of your CV tailored specifically for this job
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowOptimizeOptions(true)}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Yes, Optimize My CV
              </button>
              <button
                onClick={onSkip}
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                No Thanks
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">Choose Optimization Level</h3>
            <p className="mb-6 opacity-90">
              Select how aggressively you want to optimize your CV
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => onOptimize('honest')}
                className="p-6 bg-white text-gray-900 rounded-xl hover:shadow-2xl transition-all text-left"
              >
                <h4 className="font-bold text-lg mb-2">Honest</h4>
                <p className="text-sm text-gray-600">
                  Reword existing experience with better keywords. No exaggeration.
                </p>
              </button>
              <button
                onClick={() => onOptimize('aggressive')}
                className="p-6 bg-white text-gray-900 rounded-xl hover:shadow-2xl transition-all text-left"
              >
                <h4 className="font-bold text-lg mb-2">Aggressive</h4>
                <p className="text-sm text-gray-600">
                  Emphasize heavily and add related keywords liberally.
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
