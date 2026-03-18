import React from 'react';

const Selection = () => {
  // We removed ({ isOpen, onClose }) for now to stop the error
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. The Blurred White Background Overlay */}
      <div className="absolute inset-0 bg-white/100"></div>

      {/* 2. The Main Card Container */}
      <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
        
        {/* Header Section with Profile Icon */}
        <div className="bg-[#1a1a1a] p-12 flex justify-center relative">
          <div className="bg-white/5 p-4 rounded-full">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-10 pt-0 text-center">
          <h2 className="text-white text-2xl font-semibold mb-10 leading-snug">
            Are you trying to access<br />
            the report? Tell us who<br />
            you are.
          </h2>

          <div className="flex flex-col gap-5">
            <button className="w-full py-4 bg-[#4B1B7D] hover:bg-[#3d1664] text-white text-lg font-medium rounded-full transition-all duration-200 shadow-lg">
              Teacher
            </button>
            <button className="w-full py-4 bg-[#4B1B7D] hover:bg-[#3d1664] text-white text-lg font-medium rounded-full transition-all duration-200 shadow-lg">
              Individual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selection;