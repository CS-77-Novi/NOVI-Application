'use client';

import IndRoom from "@/components/ind-components/Ind-Room";
import IndSetUp from "@/components/ind-components/Ind-Setup";
import IndStartScreen from "@/components/ind-components/Ind-StartScreen";
import { useState } from "react";
import { useUser } from '@clerk/nextjs';

const IndLearnPage = () => {
    const { user } = useUser();
    const [currentView, setCurrentView] = useState<'start' | 'setup' | 'room'>('start');
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    
    const handleStart = async () => {
        // Clean up any previous session data for this user
        if (user?.id) {
            try {
                await fetch(`/api/individual_session/cleanup?host_id=${user.id}`, {
                    method: 'DELETE',
                });
            } catch (err) {
                console.error('Cleanup failed:', err);
            }
        }
        setCurrentView('setup');
    };

    const handleJoinRoom = () => {
        setCurrentView('room');
    };

    if (currentView === 'room') {
        return <IndRoom initialVideoEnabled={isVideoEnabled} initialAudioEnabled={isAudioEnabled} />;
    }

    if (currentView === 'setup') {
        return <IndSetUp
            onJoinRoom={handleJoinRoom}
            isVideoEnabled={isVideoEnabled}
            setIsVideoEnabled={setIsVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            setIsAudioEnabled={setIsAudioEnabled}
        />;
    }
 return <IndStartScreen onStart={handleStart} />;
}

export default IndLearnPage