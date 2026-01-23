import React from 'react';

interface UploadSectionProps {
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onAnalyze: () => void;
  analysisMethod: string;
  setAnalysisMethod: (method: string) => void;
}

export default function UploadSection({
  cvFile,
  setCvFile,
  jobDescription,
  setJobDescription,
  onAnalyze,
  analysisMethod,
  setAnalysisMethod,
}: UploadSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setCvFile(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <h2 className="relative text-5xl md:text-6xl font-bold gradient-text px-8 py-4">
              Transform Your CV
            </h2>
          </div>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Upload your CV and paste the job description to get instant AI-powered analysis and optimization
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-12 space-y-10">
        {/* CV Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold">
              1
            </span>
            Upload Your CV
          </label>

          {!cvFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="group border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-500/5 to-blue-500/5 hover:from-purple-500/10 hover:to-blue-500/10"
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <div className="mb-4 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg text-gray-200 font-medium mb-2">
                  <span className="gradient-text font-bold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-400">
                  PDF, DOCX, DOC or TXT • Max 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="glass-card border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 animate-shimmer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{cvFile.name}</p>
                    <p className="text-sm text-green-300">
                      {(cvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-300 font-medium border border-red-500/30"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="job-description" className="block text-sm font-semibold text-gray-300 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold">
              2
            </span>
            Paste the Job Description
          </label>
          <div className="relative">
            <textarea
              id="job-description"
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here...&#10;&#10;Include requirements, responsibilities, and qualifications for best results."
              className="w-full px-6 py-4 glass-card text-gray-200 placeholder-gray-500 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 border border-white/10"
            />
            {jobDescription && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-300 font-medium">
                  {jobDescription.length} characters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Method Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold">
              3
            </span>
            Choose Analysis Method
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setAnalysisMethod('keyword')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${analysisMethod === 'keyword'
                ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 glass-card'
                : 'border-white/10 glass hover:border-blue-500/50'
                }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analysisMethod === 'keyword' ? 'bg-blue-500/30' : 'bg-white/10'
                  }`}>
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                {analysisMethod === 'keyword' && (
                  <svg className="w-5 h-5 text-green-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h4 className="font-bold text-white mb-2">Keyword Match</h4>
              <p className="text-sm text-gray-400">Fast analysis based on keyword matching</p>
            </button>

            <button
              type="button"
              onClick={() => setAnalysisMethod('ai')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${analysisMethod === 'ai'
                ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/10 glass-card'
                : 'border-white/10 glass hover:border-purple-500/50'
                }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analysisMethod === 'ai' ? 'bg-purple-500/30' : 'bg-white/10'
                  }`}>
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
                {analysisMethod === 'ai' && (
                  <svg className="w-5 h-5 text-green-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h4 className="font-bold text-white mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-400">Deep AI-powered contextual analysis</p>
            </button>

            <button
              type="button"
              onClick={() => setAnalysisMethod('both')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${analysisMethod === 'both'
                ? 'border-pink-500 bg-gradient-to-br from-pink-500/20 to-pink-600/10 glass-card'
                : 'border-white/10 glass hover:border-pink-500/50'
                }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analysisMethod === 'both' ? 'bg-pink-500/30' : 'bg-white/10'
                  }`}>
                  <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                {analysisMethod === 'both' && (
                  <svg className="w-5 h-5 text-green-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h4 className="font-bold text-white mb-2">Hybrid (Best) ⚡</h4>
              <p className="text-sm text-gray-400">Combined approach for 80%+ accuracy</p>
            </button>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center pt-6">
          <button
            onClick={onAnalyze}
            disabled={!cvFile || !jobDescription}
            className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none btn-modern animate-glow"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze My CV with AI
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-300 font-medium">Instant Analysis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm text-gray-300 font-medium">AI-Powered Scoring</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-sm text-gray-300 font-medium">CV Optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
}