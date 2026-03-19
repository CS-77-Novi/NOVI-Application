'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Call } from '@stream-io/video-react-sdk';

interface MeetingContextType {
  activeCall: Call | null;
  isMinimized: boolean;
  setActiveCall: (call: Call | null) => void;
  setMinimized: (minimized: boolean) => void;
  leaveCall: () => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMinimized, setMinimized] = useState(false);

  const leaveCall = async () => {
    if (activeCall) {
      await activeCall.leave();
      setActiveCall(null);
      setMinimized(false);
    }
  };

  return (
    <MeetingContext.Provider value={{ activeCall, isMinimized, setActiveCall, setMinimized, leaveCall }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }
  return context;
};
