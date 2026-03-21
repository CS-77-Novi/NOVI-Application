'use client'

import { ParticipantView, useCallStateHooks, useCall } from '@stream-io/video-react-sdk';
import { Maximize2, Mic, MicOff, Video, VideoOff, PhoneOff, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMeetingContext } from '@/providers/MeetingContext';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const MinimizedMeeting = () => {
  const router = useRouter();
  const { activeCall, setMinimized, leaveCall } = useMeetingContext();
  const call = useCall();
  const { useMicrophoneState, useCameraState, useParticipants, useLocalParticipant } = useCallStateHooks();
  
  const { isMute: isMicMuted, microphone } = useMicrophoneState();
  const { isMute: isCameraMuted, camera } = useCameraState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Find the primary participant to show (prefer others over self if they are speaking)
  // participants[0] is usually the active speaker or most relevant participant in Stream SDK
  const primaryParticipant = participants[0] || localParticipant;

  if (!activeCall || !primaryParticipant) return null;

  const handleRestore = () => {
    setMinimized(false);
    router.push(`/meeting/${activeCall.id}`);
  };

  const handleClose = () => {
      setMinimized(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-72 aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-blue-600 animate-in slide-in-from-bottom-5">
      {/* Video View */}
      <div className="relative w-full h-full">
        <ParticipantView 
          participant={primaryParticipant} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
            <div className="flex gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => microphone.toggle()}
                    className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                    {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => camera.toggle()}
                    className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                    {isCameraMuted ? <VideoOff size={14} /> : <Video size={14} />}
                </Button>
            </div>
            
            <div className="flex gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRestore}
                    title="Restore"
                    className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                >
                    <Maximize2 size={14} />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={leaveCall}
                    title="End Call"
                    className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                    <PhoneOff size={14} />
                </Button>
            </div>
        </div>

        {/* Close button - just hides the mini view but stays in call */}
        <button 
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
            <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default MinimizedMeeting;
