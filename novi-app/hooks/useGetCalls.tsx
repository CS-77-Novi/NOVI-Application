// Import a hook from Clerk to authenticate and retrieve current user context
import { useUser } from "@clerk/nextjs";
// Import Stream Video SDK client and the Call object type definition
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
// Import core React hooks for local state and lifecycle effects
import { useEffect, useState } from "react";


// Define and export a custom hook named useGetCalls
export const useGetCalls = () => {
    // Extract the 'user' object from the active Clerk session
    const {user} = useUser();
    // Retrieve the active instance of the Stream Video Client
    const client = useStreamVideoClient();
    // State to store the array of fetched 'Call' objects; initially undefined
    const [calls,setCalls] = useState<Call[]>();
    // State to control and reflect the active network fetching status
    const [isLoading, setIsLoading ] = useState(false);

    // useEffect hook to fetch calls whenever the client or user ID changes
    useEffect (() =>{
        // Define an asynchronous function to execute the API call
        const loadCalls = async () =>{
           // If the Stream client isn't ready or user lacks an ID, do not proceed
           if (!client || !user?.id) return;


            // Signal the start of data fetching by toggling isLoading state
            setIsLoading (true);
            try{
                // Request the user's specific calls matching explicit conditions from Stream API
                const { calls } = await client.queryCalls({
                    // Instruct Stream API to sort the returned calls by start time (newest first)
                    sort:[{ field: 'starts_at',direction:-1}],
                    // Only fetch calls meeting these precise filter parameters
                    filter_conditions:{
                        // Rule: The call must have a defined start time
                        starts_at: { $exists: true },
                        // Rule: Matches calls matching EITHER logic array conditions:
                        $or: [
                            // 1. The call was originally instantiated (created) by this user
                            {created_by_user_id: user.id },
                            // 2. Or, this user's ID is explicitly listed in the 'members' array
                            {members: {$in: [user.id]}},
                        ], 
                    },
                });
            // Update local state with the successfully queried array of calls
            setCalls (calls);
            }catch (error){
                // Catch any network rejections/errors and log them in the console
                console.error(error);
            }finally {
                // Irrespective of success or failure, mark loading phase as completed
                setIsLoading(false);
            }

        };
          
        // Actually invoke the data loader defined above
        loadCalls()
    // The dependency array: effect restarts if client instance swaps or user ID changes
    },[client ,user?.id])

    // Capture the exact moment this render occurs
    const now = new Date();

    // endedCalls: Filter the entire calls array to yield only completed sessions
    // Definition: A call is "ended" if either:
    //   * Its start time historically exists BEFORE the current 'now' timestamp.
    //   * It explicitly contains an endedAt recorded timestamp indicating termination.
    const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
        return (startsAt && new Date(startsAt) < now) || !!endedAt
    })


    // upcomingCalls: Filter the entire calls array to yield only pending future sessions
    // Definition: A call is "upcoming" if it has a start time that exists strictly AFTER 'now'.
    const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
        return startsAt && new Date(startsAt) > now
    })

// Conclude the hook by exporting an object containing the structured data
// Note: 'callRecordings' is simply an alias mapping directly to the raw, unfiltered 'calls' array
return { endedCalls, upcomingCalls, callRecordings: calls , isLoading}

}