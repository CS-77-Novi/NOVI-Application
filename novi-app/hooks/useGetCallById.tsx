'use client' // Directs Next.js to execute this file exclusively on the client-side

// Import Call object type and the Stream Video SDK client hook
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
// Import standard React hooks for managing state and side effects
import { useEffect, useState } from "react";

// Export a custom hook that fetches a specific meeting call relying on its ID
export const useGetCallById = (id: string | string[]) => {
    // State to store the retrieved Call object once it's loaded
    const [call, setCall] = useState<Call>();
    // State to track if the call data is currently being fetched (defaults to true)
    const [isCallLoading, setIsCallLoading] = useState(true);
    // Initialize the Stream client instance to interact with the API
    const client = useStreamVideoClient();

    // Effect hook that attempts to load the call whenever the client or ID changes
    useEffect(() => {
        // If the Stream client hasn't mounted/initialized yet, abort the effect
        if (!client) return;

        // Define an asynchronous helper function to query the API
        const loadcall = async () => {
            try {
                // Request calls from the Stream API that match the provided ID condition
                const { calls } = await client.queryCalls({ filter_conditions: { id } });
                
                // If a matching call is returned, save the first one into our 'call' state
                if (calls.length > 0) setCall(calls[0]);
                
                // Mark the loading process as finished successfully
                setIsCallLoading(false);

            } catch (error:any) {
                // Log any API fetching errors to the console
                console.error(error);
                // Mark the loading process as finished even if it failed
                setIsCallLoading(false);
            }
        }

        // Invoke the asynchronous loadcall function
        loadcall()

    // Dependency array ensures this only reruns when 'client' or 'id' updates
    }, [client, id])

    // Return the loaded call object and its loading status to the consuming component
    return { call, isCallLoading };
}
