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
    const {id} = useParams<{ id: string}>();
     if(!id) return
    const { isLoaded, user } = useUser();
    const { call, isCallLoading } = useGetCallById(id);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const { setActiveCall, setMinimized } = useMeetingContext();

    useEffect(() => {
        if (call) {
            setActiveCall(call);
            setMinimized(false);
        }
        // When leaving the page, we don't necessarily want to clear the active call
        // because we might be minimizing it. 
        // The MeetingRoom "Home" button will handle minimization.
    }, [call, setActiveCall, setMinimized]);

    if (!isLoaded || isCallLoading) return <Loading/>;

    if (!call) return (
        <p className="text-center text-3xl font-bold text-white">
          Call Not Found
        </p>
    );

    const notAllowed = call.type === 'invited' && (!user || !call.state.members.find
        ((m) => m.user.id === user.id));

    if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

    return (
        <main className="h-screen w-full">
            <StreamCall call={call}>
                <StreamTheme>
        
                {!isSetupComplete ? (
                    <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
                ) : (
                    <MeetingRoom/>
                )}
                </StreamTheme>
            </StreamCall>
      </main>
    )
}

export default MeetingPage