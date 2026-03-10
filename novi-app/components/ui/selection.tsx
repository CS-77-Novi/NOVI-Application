'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// 1. Define the TypeScript interface so it knows 'onClose' exists
interface SelectionProps {
  onClose: () => void;
}

const Selection = ({ onClose }: SelectionProps) => {
  const router = useRouter();

  return (
    /* Full-screen wrapper with high z-index */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* 2. The Solid White Background Overlay */}
      <div 
        className="absolute inset-0 bg-white/50" 
        onClick={onClose} // This allows clicking the background to exit
      ></div>

      {/* 3. The Main Card Container */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-50 p-12 flex justify-center relative">
          <div className="bg-[#4B1B7D]/5 p-4 rounded-full">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4B1B7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          
          {/* X Close Button on the card */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Section */}
        <div className="p-10 pt-0 text-center">
          <h2 className="text-slate-800 text-2xl font-semibold mb-10 leading-snug">
            Are you trying to access<br />
            the report? Tell us who<br />
            you are.
          </h2>

          <div className="flex flex-col gap-5">
            <button 
              onClick={() => router.push('/reports/overview')}
              className="w-full py-4 bg-[#4B1B7D] hover:bg-[#3d1664] text-white text-lg font-medium rounded-full transition-all duration-200 shadow-lg"
            >
              Teacher
            </button>
            <button 
              onClick={() => router.push('/reports/individual')}
              className="w-full py-4 bg-[#4B1B7D] hover:bg-[#3d1664] text-white text-lg font-medium rounded-full transition-all duration-200 shadow-lg"
            >
              Individual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selection;