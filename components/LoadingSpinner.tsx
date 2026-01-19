import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
      <p className="mt-6 text-lg text-gray-700 font-medium animate-pulse">{message}</p>
      <p className="mt-2 text-sm text-gray-500">This may take a moment...</p>
    </div>
  );
}
