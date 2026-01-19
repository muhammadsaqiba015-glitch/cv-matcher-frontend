import React from 'react';

interface OptimizationSectionProps {
  optimizedCV: any;
  onDownload: () => void;
  onReset: () => void;
}

export default function OptimizationSection({
  optimizedCV,
  onDownload,
  onReset,
}: OptimizationSectionProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">CV Optimized Successfully!</h2>
        <p className="text-gray-700">
          Your CV has been tailored to match the job description
        </p>
      </div>

      {/* Changes Made */}
      {optimizedCV.changesSummary && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Changes Made</h3>
          <div className="space-y-3">
            {optimizedCV.changesSummary.addedKeywords?.length > 0 && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Added Keywords</p>
                  <p className="text-sm text-gray-600">
                    {optimizedCV.changesSummary.addedKeywords.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {optimizedCV.changesSummary.emphasizedSkills?.length > 0 && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Emphasized Skills</p>
                  <p className="text-sm text-gray-600">
                    {optimizedCV.changesSummary.emphasizedSkills.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {optimizedCV.changesSummary.reorderedExperience && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="font-medium text-gray-900">
                  Reordered experience (most relevant first)
                </p>
              </div>
            )}

            {optimizedCV.changesSummary.optimizedSummary && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="font-medium text-gray-900">
                  Optimized professional summary
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700">
                Total changes: {optimizedCV.changesSummary.totalChanges}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CV Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">CV Preview</h3>
        <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {optimizedCV.optimizedCV && (
              <>
                {/* Contact Info */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">{optimizedCV.optimizedCV.contactInfo.name}</h2>
                  <p className="text-gray-600">
                    {optimizedCV.optimizedCV.contactInfo.email} | {optimizedCV.optimizedCV.contactInfo.phone}
                  </p>
                </div>

                {/* Summary */}
                {optimizedCV.optimizedCV.summary && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Professional Summary</h3>
                    <p>{optimizedCV.optimizedCV.summary}</p>
                  </div>
                )}

                {/* This is a simplified preview - the full PDF will have complete formatting */}
                <p className="text-sm text-gray-500 italic mt-4">
                  Preview is simplified. Download PDF for the complete formatted version.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Download Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onDownload}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </span>
        </button>
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Analyze Another CV
        </button>
      </div>
    </div>
  );
}
