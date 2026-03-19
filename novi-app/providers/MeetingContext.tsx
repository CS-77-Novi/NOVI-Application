'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Call } from '@stream-io/video-react-sdk';

interface MeetingContextType {
  activeCall: Call | null;
  isMinimized: boolean;
  isSetupComplete: boolean;
  setActiveCall: (call: Call | null) => void;
  setMinimized: (minimized: boolean) => void;
  setSetupComplete: (complete: boolean) => void;
  leaveCall: () => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMinimized, setMinimized] = useState(false);
  const [isSetupComplete, setSetupComplete] = useState(false);

  const leaveCall = async () => {
    if (activeCall) {
      await activeCall.leave();
      setActiveCall(null);
      setMinimized(false);
      setSetupComplete(false);
    }
  };

  return (
    <MeetingContext.Provider value={{ 
      activeCall, 
      isMinimized, 
      isSetupComplete, 
      setActiveCall, 
      setMinimized, 
      setSetupComplete,
      leaveCall 
    }}>
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
