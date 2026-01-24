'use client';

import React, { useState } from 'react';

interface ResultsDisplayProps {
    results: {
        interviewChance: number;
        isFake?: boolean;
        recommendation: {
            level: string;
            message: string;
        };
        breakdown: {
            keywordScore: number;
            aiScore: number;
        };
        aspects: Record<string, { score: number; feedback: string }>;
        strengths: string[];
        weaknesses: string[];
        summary: string;
        detailedAssessment?: string;
        keywordAnalysis?: {
            matched: string[];
            missing: string[];
            matchPercentage: number;
        };
    };
    onOptimize?: (level: 'honest' | 'aggressive') => void;
    isOptimizing: boolean;
}

export default function ResultsDisplay({ results, onOptimize, isOptimizing }: ResultsDisplayProps) {
    const [showOptimizeOptions, setShowOptimizeOptions] = useState(false);
    const [showKeywordDetails, setShowKeywordDetails] = useState(false);

    // If fake document, show the humorous message
    if (results.isFake) {
        return (
            <div className="glass-card rounded-3xl p-8 border border-red-500/30 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">🤨</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{results.recommendation.level}</h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                    {results.summary}
                </p>
                <div className="mt-8 p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-sm">
                        💡 <strong>Tip:</strong> Upload a real CV (PDF, DOCX, or TXT) and paste an actual job description to get meaningful analysis!
                    </p>
                </div>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-green-400 to-emerald-600';
        if (score >= 65) return 'from-blue-400 to-blue-600';
        if (score >= 45) return 'from-yellow-400 to-orange-500';
        if (score >= 30) return 'from-orange-400 to-red-500';
        return 'from-red-400 to-red-600';
    };

    const getScoreTextColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 65) return 'text-blue-500';
        if (score >= 45) return 'text-yellow-500';
        if (score >= 30) return 'text-orange-500';
        return 'text-red-500';
    };

    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (results.interviewChance / 100) * circumference;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Main Score Card */}
            <div className="glass-card rounded-3xl p-8 border border-white/10 text-center">
                <h2 className="text-3xl font-bold text-white mb-8">Analysis Results</h2>

                {/* Circular Progress */}
                <div className="relative w-72 h-72 mx-auto mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="144"
                            cy="144"
                            r="120"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="16"
                            fill="none"
                        />
                        <circle
                            cx="144"
                            cy="144"
                            r="120"
                            stroke="url(#scoreGradient)"
                            strokeWidth="16"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={results.interviewChance >= 65 ? '#3B82F6' : '#F59E0B'} />
                                <stop offset="100%" stopColor={results.interviewChance >= 65 ? '#8B5CF6' : '#EF4444'} />
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
                                <span className={`text-2xl font-bold ${getScoreTextColor(aspect.score)}`}>
                                    {aspect.score}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-3">
                                <div
                                    className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(aspect.score)} transition-all duration-500`}
                                    style={{ width: `${aspect.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400">{aspect.feedback}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="glass-card rounded-2xl p-8 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-600/5">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        Strengths
                    </h3>
                    {results.strengths && results.strengths.length > 0 ? (
                        <ul className="space-y-3">
                            {results.strengths.map((strength: string, index: number) => (
                                <li key={index} className="flex items-start group">
                                    <span className="text-green-400 mr-3 mt-1 text-lg flex-shrink-0">✓</span>
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-sm">No specific strengths identified. Consider optimizing your CV.</p>
                    )}
                </div>

                {/* Weaknesses */}
                <div className="glass-card rounded-2xl p-8 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/5">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        Areas to Improve
                    </h3>
                    {results.weaknesses && results.weaknesses.length > 0 ? (
                        <ul className="space-y-3">
                            {results.weaknesses.map((weakness: string, index: number) => (
                                <li key={index} className="flex items-start group">
                                    <span className="text-red-400 mr-3 mt-1 text-lg flex-shrink-0">✗</span>
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-sm">No significant weaknesses identified. Great job!</p>
                    )}
                </div>
            </div>

            {/* Keyword Analysis Toggle */}
            {results.keywordAnalysis && (
                <div className="glass-card rounded-2xl p-8 border border-white/10">
                    <button
                        onClick={() => setShowKeywordDetails(!showKeywordDetails)}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-2xl font-bold text-white flex items-center">
                            <span className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></span>
                            Keyword Details
                        </h3>
                        <svg
                            className={`w-6 h-6 text-gray-400 transition-transform ${showKeywordDetails ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showKeywordDetails && (
                        <div className="mt-6 space-y-6">
                            {results.keywordAnalysis.matched && results.keywordAnalysis.matched.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-green-400 mb-3">Matched Keywords ({results.keywordAnalysis.matched.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.keywordAnalysis.matched.map((keyword, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.keywordAnalysis.missing && results.keywordAnalysis.missing.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-red-400 mb-3">Missing Keywords ({results.keywordAnalysis.missing.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.keywordAnalysis.missing.map((keyword, index) => (
                                            <span key={index} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
                {results.detailedAssessment && (
                    <p className="text-gray-400 leading-relaxed text-sm mt-4 pt-4 border-t border-white/10">
                        {results.detailedAssessment}
                    </p>
                )}
            </div>

            {/* Optimize CTA - Only show if onOptimize is provided */}
            {onOptimize && (
                <div className="relative glass-card rounded-3xl p-10 border-2 border-purple-500/30 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 opacity-50"></div>

                    {!showOptimizeOptions ? (
                        <div className="relative text-center">
                            <h3 className="text-3xl font-bold text-white mb-4">Want to Improve Your Score?</h3>
                            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                                Let our AI optimize your CV to better match this job description. Choose between honest improvements or aggressive optimization for maximum match.
                            </p>
                            <button
                                onClick={() => setShowOptimizeOptions(true)}
                                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                            >
                                🚀 Optimize My CV
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Optimization Level</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Honest Option */}
                                <button
                                    onClick={() => onOptimize('honest')}
                                    disabled={isOptimizing}
                                    className="p-6 glass rounded-2xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">Honest</h4>
                                            <p className="text-sm text-blue-400">Recommended</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Reword existing experience to match job terminology. No exaggeration or false claims. Maintain authenticity.
                                    </p>
                                    <div className="mt-4 text-blue-400 text-sm font-medium group-hover:text-blue-300">
                                        Expected improvement: 10-20% →
                                    </div>
                                </button>

                                {/* Aggressive Option */}
                                <button
                                    onClick={() => onOptimize('aggressive')}
                                    disabled={isOptimizing}
                                    className="p-6 glass rounded-2xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">Aggressive</h4>
                                            <p className="text-sm text-orange-400">Maximum Match</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Add ALL keywords from job description. Rewrite everything to perfectly align. Target: <strong className="text-orange-400">100% match</strong>.
                                    </p>
                                    <div className="mt-4 text-orange-400 text-sm font-medium group-hover:text-orange-300">
                                        Target: 95-100% match →
                                    </div>
                                </button>
                            </div>

                            {isOptimizing && (
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center px-6 py-3 glass rounded-xl">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-purple-400" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-white font-medium">Optimizing your CV...</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowOptimizeOptions(false)}
                                className="mt-6 text-gray-400 hover:text-white transition-colors text-sm mx-auto block"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}