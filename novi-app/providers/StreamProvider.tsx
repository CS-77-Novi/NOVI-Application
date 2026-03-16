'use client'
// Marks this file as a Client Component (runs in the browser)

import { useUser } from "@clerk/nextjs"; // Clerk hook to access the authenticated user on the client
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk"; 
// Stream Video React components and client SDK
import { ReactNode, useEffect, useState } from "react";
// React utilities for typing children, managing state, and side effects
import { tokenProvider } from '@/actions/stream.actions';
// Server Action that securely generates Stream user tokens
import Loading from "@/components/Loading"; // Loading UI shown while Stream client is being initialized

// Loading UI shown while Stream client is being initialized


const StreamProvider = ({ children }: { children: ReactNode }) => {
// React provider component that wraps the app with Stream Video context
    const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const [videoClient, setVideoClient] = 
    useState<StreamVideoClient>(); // Stores the initialized StreamVideoClient instance
    const { user, isLoaded } = useUser(); // Gets the current Clerk user and loading state

    useEffect(() => {
        // Runs when user or isLoaded changes

        if (!isLoaded || !user) return; // Exit early if user data is not ready or user is not logged in
        console.log("Initializing Stream client for user:", user.id);
        if (!API_KEY) {
            console.error("Stream API key is missing from environment variables");
            return;
        }

        const client = new StreamVideoClient({
         // Creates a new Stream Video client instance

            apiKey: API_KEY,
            user: {
              id: user?.id, // Unique user ID (must match the server token user_id)
              name: user.firstName || user?.username || 'User', // Display name fallback logic
              image: user?.imageUrl, // User avatar image

            },
            tokenProvider: async () => {
                console.log("Token provider requested for user:", user.id);
                try {
                    const token = await tokenProvider();
                    if (!token) throw new Error("Token provider returned empty result");
                    console.log("Token provider successfully returned token");
                    return token;
                } catch (err) {
                    console.error("Token provider ERROR:", err);
                    throw err;
                }
            },
            options: {
                timeout: 10000, // Increase timeout to 10s to handle slow connections
            }
        });
        setVideoClient(client); // Saves the Stream client in state

        return () => {
        // Cleanup function when component unmounts or dependencies change
            console.log("Disconnecting Stream client");
            client.disconnectUser().catch(e => console.error("Error disconnecting Stream user:", e));
            setVideoClient(undefined); // Clears the client from state
        };

    },[user,isLoaded]) // Re-run effect when user data or loading state changes

    if (!videoClient) 
        return <Loading />; // Show loading UI until Stream client is ready

    return <StreamVideo client={videoClient}>
                {children}
            </StreamVideo>;
    // Provides Stream Video context to all child components
    
}

export default StreamProvider;
// Exports the provider so it can wrap your app