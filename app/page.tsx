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

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        '/api/generate-pdf',
        { optimizedCV },
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Optimized_CV_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('PDF generation failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Rate Your CV
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered CV analysis and optimization
              </p>
            </div>
            {step !== 'upload' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
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
          <LoadingSpinner message="Analyzing your CV..." />
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
            onDownload={handleDownloadPDF}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Made by Saqib • for better job applications
          </p>
        </div>
      </footer>
    </div>
  );
}