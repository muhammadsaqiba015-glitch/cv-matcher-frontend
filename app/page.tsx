'use client';

import React, { useState, useRef } from 'react';
import ResultsDisplay from '../components/ResultsDisplay';

export default function Home() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [optimizedCV, setOptimizedCV] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.docx', '.txt'];

      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
        setError('Please upload a PDF, DOCX, or TXT file');
        return;
      }

      setCvFile(file);
      setError(null);
      setResults(null);
      setOptimizedCV(null);
    }
  };

  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      setError('Please upload a CV and enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setOptimizedCV(null);

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);
      formData.append('jdText', jdText);

      const response = await fetch('/api/analyze-files', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('Analysis results:', data);
      console.log('Strengths:', data.strengths);
      console.log('Weaknesses:', data.weaknesses);

      setResults(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async (level: 'honest' | 'aggressive') => {
    if (!cvFile || !jdText.trim()) {
      setError('CV file and job description are required for optimization');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);
      formData.append('jdText', jdText);
      formData.append('level', level);
      formData.append('analysisResults', JSON.stringify(results));

      const response = await fetch('/api/optimize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Optimization failed');
      }

      console.log('Optimization results:', data);
      setOptimizedCV(data);
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError(err.message || 'Failed to optimize CV. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJdText('');
    setResults(null);
    setOptimizedCV(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyOptimizedCV = () => {
    if (optimizedCV?.optimizedCV) {
      navigator.clipboard.writeText(optimizedCV.optimizedCV);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Rate Your <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">CV</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get AI-powered analysis of how well your CV matches any job description.
            Brutally honest scoring with actionable improvements.
          </p>
        </div>

        {!results ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                Upload Your CV
              </h2>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${cvFile
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
                  }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {cvFile ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white font-medium">{cvFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCvFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-4 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PDF, DOCX, or TXT (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                Paste Job Description
              </h2>

              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                {jdText.length} characters • Paste the complete job posting for best results
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!cvFile || !jdText.trim() || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${!cvFile || !jdText.trim() || isAnalyzing
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] shadow-xl'
                }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                '🎯 Analyze My CV'
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <button
              onClick={handleReset}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Analyze Another CV
            </button>

            <ResultsDisplay
              results={results}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
            />

            {optimizedCV && (
              <div className="glass-card rounded-2xl p-8 border border-green-500/30 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <span className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                      ✨
                    </span>
                    Optimized CV
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
                      Expected Score: {optimizedCV.expectedScore}%
                    </span>
                    <button
                      onClick={copyOptimizedCV}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {optimizedCV.changes && optimizedCV.changes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Changes Made:</h4>
                    <ul className="space-y-2">
                      {optimizedCV.changes.map((change: string, index: number) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="text-green-400 mr-2">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {optimizedCV.keywordsAdded && optimizedCV.keywordsAdded.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Keywords Added:</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedCV.keywordsAdded.map((keyword: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          + {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {optimizedCV.optimizedCV}
                  </pre>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}