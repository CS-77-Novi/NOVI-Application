'use client'

import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMeetingContext } from "@/providers/MeetingContext";

const MeetingPage = () => {
    const { id } = useParams<{ id: string }>();
    const { isLoaded, user } = useUser();
    const { activeCall, setMinimized, isSetupComplete: globalSetupComplete } = useMeetingContext();
    const [localSetupComplete, setLocalSetupComplete] = useState(false);

    useEffect(() => {
        if (activeCall && activeCall.id === id) {
            setMinimized(false);
        }
    }, [activeCall, id, setMinimized]);

    // Wait for the global layout to fetch and provide the call
    if (!isLoaded || !activeCall || activeCall.id !== id) return <Loading />;

    const notAllowed = activeCall.type === 'invited' && (!user || !activeCall.state.members.find
        ((m) => m.user.id === user.id));

    if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

    // Use either the local setup state (first join) or the global one (returning from home)
    const isSetupComplete = globalSetupComplete || localSetupComplete;

    return (
        <main className="h-screen w-full">
            {!isSetupComplete ? (
                <MeetingSetup setIsSetupComplete={setLocalSetupComplete} />
            ) : (
                <MeetingRoom />
            )}
        </main>
    )
}

export default MeetingPage