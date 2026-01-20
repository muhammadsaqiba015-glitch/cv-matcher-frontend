import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      {/* Animated Rings */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>

        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin"></div>

        {/* Middle ring */}
        <div className="absolute inset-3 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-blue-500 border-r-pink-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

        {/* Inner glow */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 animate-pulse"></div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold text-white animate-pulse">{message}</p>
        <p className="text-sm text-gray-400">Please wait, this may take a moment...</p>
      </div>

      {/* Animated dots */}
      <div className="flex space-x-2 mt-8">
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-white/10 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-shimmer"></div>
      </div>
    </div>
  );
}
