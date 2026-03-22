'use client' // Directs Next.js to render this file exclusively on the client side

// Import core React functions needed to create and consume Context, plus types
import React, { createContext, useContext, useState, ReactNode } from 'react';
// Import the Call object type from the Stream SDK to strongly type our state
import { Call } from '@stream-io/video-react-sdk';

// Define the TypeScript interface shaping the properties available inside this Context
interface MeetingContextType {
  activeCall: Call | null; // The current ongoing meeting/call object, or null if none
  isMinimized: boolean;    // Tracks whether the active call window is minimized (e.g. PiP)
  isSetupComplete: boolean; // Tracks whether the user has passed the initial device setup screen
  setActiveCall: (call: Call | null) => void; // Setter to change the currently active call
  setMinimized: (minimized: boolean) => void; // Setter for toggling the minimized state
  setSetupComplete: (complete: boolean) => void; // Setter to mark setup as finished
  leaveCall: () => Promise<void>; // Async function to safely disconnect from the active call
}

// Instantiate the React Context with the defined type (initially undefined before mounting)
const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

// Export the Provider component that wraps around the rest of the application
export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  // State hook to store the active Stream Call object
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  // State hook to manage the minimized/floating UI view
  const [isMinimized, setMinimized] = useState(false);
  // State hook to manage boolean flagging if the Pre-join setup is complete
  const [isSetupComplete, setSetupComplete] = useState(false);

  // Define the comprehensive wrapper function to handle leaving a meeting
  const leaveCall = async () => {
    // Only attempt to disconnect if there's actually an active call
    if (activeCall) {
      try {
        // Await the native Stream SDK method to formally leave the media session
        await activeCall.leave();
      } catch (error) {
        // Catch any errors (e.g., if the SDK already forced a disconnect) and log them safely
        // Ignored if the user already left the call (e.g. due to ending it)
        console.log("Call was already left or could not be left:", error);
      }
      // Regardless of successful cleanup or error, strictly reset all local Context states
      setActiveCall(null);     // Clear the call reference
      setMinimized(false);     // Reset window minimization
      setSetupComplete(false); // Force the user to redo setup for the next call
    }
  };

  // Return the actual Provider component wrapped around the injected `children`
  return (
    // Pass the state variables and their respective setter functions down via the `value` prop
    <MeetingContext.Provider value={{ 
      activeCall, 
      isMinimized, 
      isSetupComplete, 
      setActiveCall, 
      setMinimized, 
      setSetupComplete,
      leaveCall 
    }}>
      {/* Render all nested React tree components that need access to this state */}
      {children}
    </MeetingContext.Provider>
  );
};

// Export a custom hook to easily consume this Context from other components
export const useMeetingContext = () => {
  // Retrieve the current context value
  const context = useContext(MeetingContext);
  // Throw a descriptive error if a component tries to use this hook outside of the Provider
  if (!context) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }
  // Return the guaranteed established Context for consumption
  return context;
};
