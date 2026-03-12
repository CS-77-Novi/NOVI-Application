'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Selection() {
  const router = useRouter();

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-[350px] rounded-[1.5rem] bg-[#1a1622] p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5a546b]">
            <svg
              className="h-8 w-8 text-[#5a546b]"
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
          <h2 className="text-[17px] font-medium leading-relaxed text-white">
            Are you trying to access the report? Tell us
            <br />
            who you are.
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('@/components/report/teacher')}
            className="w-full rounded-xl bg-[#8b4deb] py-3 text-sm font-medium text-white transition-colors hover:bg-[#723ac9]"
          >
            Teacher
          </button>
          <button
            onClick={() => router.push('@/components/report/individual')}
            className="w-full rounded-xl bg-[#8b4deb] py-3 text-sm font-medium text-white transition-colors hover:bg-[#723ac9]"
          >
            Individual
          </button>
        </div>
      </div>
    </div>
  );
}