'use Client'//that this component must run on the client side
// Stream Video SDK hooks
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
// Next.js router for navigation
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useMeetingContext } from "@/providers/MeetingContext";

const EndCallButton = () => {
    // Initialize Next.js router   to make the end call button work
    const router = useRouter();
    const { leaveCall } = useMeetingContext();
    // Get the current call instance
    const call = useCall();
    // Ensure this component is used inside a StreamCall provider
    if (!call)
        throw new Error(
            'usesStreamCall must be used within a StreamCall component.',
        );
    // Extract local participant hook
    const { useLocalParticipant } = useCallStateHooks();
    // Get the current (local) participant
    const localParticipant = useLocalParticipant();
    // Check if the current user is the meeting creator/host
    const isMeetingOwner =
        localParticipant &&
        call.state.createdBy &&
        localParticipant.userId === call.state.createdBy.id;
    // Only the meeting owner can see the End Call button
    if (!isMeetingOwner) return null;
    // Function to end the call for all participants
        const endcall =async () =>{
            // End the call
            await call.endCall();

            // We MUST await this so the browser doesn't cancel the request when routing away!
            try {
                await fetch(`/api/meeting/${call.id}/group_report_gen`);
            } catch (err) {
            console.error('[Excel Gen trigger error]', err);
            }
            
            // Clear global state
            await leaveCall();

            // Redirect user to home page
            router.push('/');
        };

    return (
        // Button to end the call for everyone
        <Button onClick={endcall} className="bg-red-500">
            End call for everyone
        </Button>
    );

}

export default EndCallButton