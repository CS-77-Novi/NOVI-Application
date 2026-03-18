'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SelectionProps {
  onClose?: () => void;
}

export default function Selection({ onClose }: SelectionProps) {
  const router = useRouter();

  /**
   * Navigates to the respective dashboard and 
   * closes the modal overlay.
   */
  const handleNavigation = (role: 'teacher' | 'individual') => {
     
    
    router.push(`/reports/${role}`);
    
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 1. The Blurred White Background Overlay */}
      {/* Clicking the blur will trigger onClose to return to the previous screen */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* 2. The Main Card Container */}
      <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a] rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in slide-in-from-bottom-4 duration-300">
        
        {/* Header Section with Profile Icon */}
        <div className="bg-[#1a1a1a] p-12 pb-6 flex justify-center relative">
          <div className="bg-white/5 p-4 rounded-full shadow-inner">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-10 pt-4 text-center">
          <h2 className="text-white text-2xl font-bold mb-10 leading-tight tracking-tight">
            Are you trying to access<br />
            the report? Tell us who<br />
            you are.
          </h2>

          <div className="flex flex-col gap-4">
            {/* Teacher Button */}
            <button 
              onClick={() => handleNavigation('teacher')}
              className="w-full py-4 bg-[#4B1B7D] hover:bg-[#5d2399] text-white text-lg font-bold rounded-2xl transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              Teacher
            </button>

            {/* Individual Button */}
            <button 
              onClick={() => handleNavigation('individual')}
              className="w-full py-4 bg-[#4B1B7D] hover:bg-[#5d2399] text-white text-lg font-bold rounded-2xl transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              Individual
            </button>
          </div>

          {/* Cancel Link */}
          <button 
            onClick={onClose}
            className="mt-8 text-slate-500 hover:text-white text-sm font-semibold transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}