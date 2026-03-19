'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useMeetingContext } from '@/providers/MeetingContext';
import MinimizedMeeting from './MinimizedMeeting';

const MeetingLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { activeCall, isMinimized } = useMeetingContext();
  const pathname = usePathname();
  const isMeetingPage = pathname.includes('/meeting/');

  return (
    <>
      {/* 
        Provide StreamCall context globally if a call is active and we are NOT on the full meeting page.
        The meeting page handles its own StreamCall context.
      */}
      {activeCall && !isMeetingPage && (
        <StreamCall call={activeCall}>
          <StreamTheme>
            {isMinimized && <MinimizedMeeting />}
          </StreamTheme>
        </StreamCall>
      )}
      
      {/* 
        Even if we are on the meeting page, we want a StreamCall context 
        at the top if it's already in our global state. 
        However, to avoid double-rendering StreamCall triggers, 
        we let the meeting page handle it when it's in full screen mode.
      */}
      {children}
    </>
  );
};

export default MeetingLayoutWrapper;
