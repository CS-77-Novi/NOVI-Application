'use client'

import { useUser } from "@clerk/nextjs";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

const MeetingSetup =({
    setisSetupComplete,
}: {
    setisSetupComplete:(value: boolean) => void;    
}) =>{

  const{user} =useUser()
  if(!user) return

  const call = useCall();
  if (!call) {
    throw new Error(
        'useStreamCall must be used within a streamCall component.',
    );
  }

   const{ useCallEndedAt,useCallStartsAt}=useCallStateHooks();
   const CallStartsAt = useCallStartsAt();
   const CallEndedAt  = useCallEndedAt();
   const callTimeNotArrived =
        CallStartsAt&& new Date(CallStartsAt) > new Date();
   const callHasEnded = !!CallEndedAt; 

   if (callTimeNotArrived)
    

}
export default MeetingSetup