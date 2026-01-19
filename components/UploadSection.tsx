import React from 'react';

interface UploadSectionProps {
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onAnalyze: () => void;
}

export default function UploadSection({
  cvFile,
  setCvFile,
  jobDescription,
  setJobDescription,
  onAnalyze,
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Get Your CV Rated in Seconds
        </h2>
        <p className="text-lg text-gray-600">
          Upload your CV and paste the job description to see how well you match
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* CV Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Step 1: Upload Your CV
          </label>

          {!cvFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span>
                  {' '}or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOCX, DOC or TXT (max 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-900">{cvFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(cvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
            Step 2: Paste the Job Description
          </label>
          <textarea
            id="job-description"
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {jobDescription && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {jobDescription.length} characters entered
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onAnalyze}
            disabled={!cvFile || !jobDescription}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Analyze My CV
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}