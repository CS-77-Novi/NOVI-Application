'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

// Add the interface for the blur/close functionality
interface SelectionProps {
  onClose?: () => void;
}

export default function Selection({ onClose }: SelectionProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    // 1. Navigate to the actual URL route
    router.push(path);
    // 2. Close the overlay if the function exists
    if (onClose) onClose();
  };

  return (
    /* The Blurred Background Overlay */
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center p-4 backdrop-blur-md bg-white/30">
      
      {/* Clickable area outside the card to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* The Selection Card */}
      <div className="relative z-10 w-full max-w-[350px] rounded-[2.5rem] bg-[#1a1622] p-10 shadow-2xl border border-white/10">
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#5a546b] bg-[#2d2839]">
            <svg
              className="h-10 w-10 text-[#8b4deb]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-[19px] font-semibold leading-relaxed text-white">
            Are you trying to access the report? Tell us
            <br />
            who you are.
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            
            onClick={() => handleNavigation('/reports/teacher')}
            className="w-full rounded-2xl bg-[#8b4deb] py-4 text-md font-bold text-white transition-all hover:scale-105 hover:bg-[#723ac9] active:scale-95 shadow-lg shadow-purple-500/20"
          >
            Teacher
          </button>
          
          <button
            onClick={() => handleNavigation('/reports/individual')}
            className="w-full rounded-2xl bg-[#8b4deb] py-4 text-md font-bold text-white transition-all hover:scale-105 hover:bg-[#723ac9] active:scale-95 shadow-lg shadow-purple-500/20"
          >
            Individual
          </button>
        </div>

        {/* Optional Cancel/Close link */}
        <button 
          onClick={onClose}
          className="mt-6 w-full text-center text-xs text-slate-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}