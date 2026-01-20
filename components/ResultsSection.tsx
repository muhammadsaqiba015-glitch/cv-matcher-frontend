import React, { useState } from 'react';

interface ResultsSectionProps {
  results: any;
  onOptimize: (level: 'honest' | 'aggressive') => void;
  onSkip: () => void;
}

export default function ResultsSection({ results, onOptimize, onSkip }: ResultsSectionProps) {
  const [showOptimizeOptions, setShowOptimizeOptions] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 65) return 'from-blue-400 to-blue-600';
    if (score >= 45) return 'from-yellow-400 to-orange-500';
    if (score >= 30) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'shadow-green-500/50';
    if (score >= 65) return 'shadow-blue-500/50';
    if (score >= 45) return 'shadow-yellow-500/50';
    if (score >= 30) return 'shadow-orange-500/50';
    return 'shadow-red-500/50';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Main Score Card */}
      <div className="relative glass-card rounded-3xl p-10 border-2 border-white/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>

        <div className="relative text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Your Interview Chance</h2>

          {/* Circular Score */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - results.interviewChance / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`bg-gradient-to-r ${getScoreColor(results.interviewChance)}`} stopColor={results.interviewChance >= 65 ? '#3B82F6' : '#F59E0B'} />
                  <stop offset="100%" className={`bg-gradient-to-r ${getScoreColor(results.interviewChance)}`} stopColor={results.interviewChance >= 65 ? '#8B5CF6' : '#EF4444'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className={`text-7xl font-black bg-gradient-to-r ${getScoreColor(results.interviewChance)} bg-clip-text text-transparent mb-2`}>
                {results.interviewChance}%
              </div>
              <div className="px-6 py-2 glass rounded-full">
                <p className="text-lg font-bold text-white">
                  {results.recommendation.level}
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            {results.recommendation.message}
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="glass-card rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
          Score Breakdown
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-300 font-medium">Keyword Matching</p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-black text-blue-400">{results.breakdown.keywordScore}%</p>
          </div>
          <div className="glass rounded-xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-purple-300 font-medium">AI Analysis</p>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-black text-purple-400">{results.breakdown.aiScore}%</p>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="glass-card rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></span>
          Detailed Analysis
        </h3>
        <div className="space-y-5">
          {Object.entries(results.aspects).map(([key, aspect]: [string, any]) => (
            <div key={key} className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-200 text-lg capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className={`text-3xl font-black bg-gradient-to-r ${getScoreColor(aspect.score)} bg-clip-text text-transparent`}>
                  {aspect.score}%
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{aspect.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-card rounded-2xl p-8 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            Strengths
          </h3>
          <ul className="space-y-3">
            {results.strengths.map((strength: string, index: number) => (
              <li key={index} className="flex items-start group">
                <span className="text-green-400 mr-3 mt-1 text-lg">✓</span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-card rounded-2xl p-8 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {results.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start group">
                <span className="text-red-400 mr-3 mt-1 text-lg">✗</span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Summary */}
      <div className="glass-card rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          AI Summary
        </h3>
        <p className="text-gray-300 leading-relaxed text-lg">{results.summary}</p>
      </div>

      {/* Optimize CTA */}
      <div className="relative glass-card rounded-3xl p-10 border-2 border-purple-500/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 opacity-50"></div>

        {!showOptimizeOptions ? (
          <div className="relative text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Want to Improve Your Chances?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Generate an AI-optimized version of your CV tailored specifically for this job
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowOptimizeOptions(true)}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 btn-modern"
              >
                Yes, Optimize My CV
              </button>
              <button
                onClick={onSkip}
                className="px-10 py-4 glass-card border-2 border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                No Thanks
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <h3 className="text-3xl font-bold text-white mb-4 text-center">Choose Optimization Level</h3>
            <p className="text-gray-300 text-center mb-8">
              Select how aggressively you want to optimize your CV
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button
                onClick={() => onOptimize('honest')}
                className="group glass-card p-8 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 transition-all duration-300 text-left transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-2xl mb-2 text-white">Honest</h4>
                <p className="text-sm text-gray-300">
                  Reword existing experience with better keywords. No exaggeration.
                </p>
              </button>
              <button
                onClick={() => onOptimize('aggressive')}
                className="group glass-card p-8 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 transition-all duration-300 text-left transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-2xl mb-2 text-white">Aggressive</h4>
                <p className="text-sm text-gray-300">
                  Emphasize heavily and add related keywords liberally.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}