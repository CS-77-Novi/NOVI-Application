'use client'

import React, { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useMeetingContext } from '@/providers/MeetingContext';
import MinimizedMeeting from './MinimizedMeeting';
import { useGetCallById } from '@/hooks/useGetCallById';

const MeetingLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const id = params?.id as string;
  const { activeCall, setActiveCall, isMinimized } = useMeetingContext();
  const pathname = usePathname();
  const isMeetingPage = pathname.includes('/meeting/');

  // If we are on a meeting page, we try to fetch the call if it's not already active
  const { call: fetchedCall } = useGetCallById(id || '');

  useEffect(() => {
    if (isMeetingPage && fetchedCall && (!activeCall || activeCall.id !== fetchedCall.id)) {
      setActiveCall(fetchedCall);
    }
  }, [isMeetingPage, fetchedCall, activeCall, setActiveCall]);

  // Use either the globally active call (persisted) or the newly fetched one (on direct entry)
  const currentCall = activeCall || fetchedCall;

  const content = (
    <>
      {currentCall && isMinimized && !isMeetingPage && <MinimizedMeeting />}
      {children}
    </>
  );

  if (currentCall) {
    return (
      <StreamCall call={currentCall}>
        <StreamTheme>
          {content}
        </StreamTheme>
      </StreamCall>
    );
  }

  return content;
};

export default MeetingLayoutWrapper;
