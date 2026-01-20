'use client';

import { useState } from 'react';
import axios from 'axios';
import UploadSection from '@/components/UploadSection';
import ResultsSection from '@/components/ResultsSection';
import OptimizationSection from '@/components/OptimizationSection';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results' | 'optimizing' | 'optimized'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [optimizedCV, setOptimizedCV] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!cvFile || !jobDescription) {
      setError('Please upload a CV and enter a job description');
      return;
    }

    setError('');
    setStep('analyzing');

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);
      formData.append('jdText', jobDescription);

      const response = await axios.post('/api/analyze-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResults(response.data);
      setStep('results');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      setStep('upload');
    }
  };

  const handleOptimize = async (level: 'honest' | 'aggressive') => {
    setStep('optimizing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile!);
      formData.append('jdText', jobDescription);
      formData.append('optimizationLevel', level);
      formData.append('analysisResults', JSON.stringify(analysisResults));

      const response = await axios.post('/api/optimize-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setOptimizedCV(response.data);
      setStep('optimized');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Optimization failed. Please try again.');
      setStep('results');
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJobDescription('');
    setAnalysisResults(null);
    setOptimizedCV(null);
    setError('');
    setStep('upload');
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Rate Your CV
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  AI-powered CV analysis & optimization
                </p>
              </div>
            </div>
            {step !== 'upload' && (
              <button
                onClick={handleReset}
                className="px-6 py-2.5 glass-card hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-medium"
              >
                ← Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 glass-card border-red-500/50 bg-red-500/10 text-red-200 px-6 py-4 rounded-xl backdrop-blur-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {step === 'upload' && (
          <UploadSection
            cvFile={cvFile}
            setCvFile={setCvFile}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 'analyzing' && (
          <LoadingSpinner message="Analyzing your CV with AI..." />
        )}

        {step === 'results' && analysisResults && (
          <ResultsSection
            results={analysisResults}
            onOptimize={handleOptimize}
            onSkip={handleReset}
          />
        )}

        {step === 'optimizing' && (
          <LoadingSpinner message="Optimizing your CV... This may take 20-30 seconds..." />
        )}

        {step === 'optimized' && optimizedCV && (
          <OptimizationSection
            optimizedCV={optimizedCV}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-auto glass border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-400">
            Powered by <span className="gradient-text font-semibold">Claude AI</span> • Built for better job applications
          </p>
        </div>
      </footer>
    </div>
  );
}