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

  const content = (
    <>
      {activeCall && isMinimized && !isMeetingPage && <MinimizedMeeting />}
      {children}
    </>
  );

  if (activeCall) {
    return (
      <StreamCall call={activeCall}>
        <StreamTheme>
          {content}
        </StreamTheme>
      </StreamCall>
    );
  }

  return content;
};

export default MeetingLayoutWrapper;
