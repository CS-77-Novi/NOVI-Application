'use server'
// Tells Next.js this file runs only on the server (Server Action / server-only code)

import { currentUser } from "@clerk/nextjs/server";
// Imports Clerk helper to get the currently authenticated user on the server
import { StreamClient } from "@stream-io/node-sdk";
// Imports Stream's server-side SDK to generate tokens securely

const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
// Reads the Stream public API key from environment variables
const streamSecretKey = process.env.STREAM_SECRET_KEY;
// Reads the Stream secret key (PRIVATE, server-only) from environment variables


export const tokenProvider = async () => {
// Exports an async function that will generate and return a Stream user token

    const user = await currentUser(); // Fetches the currently logged-in Clerk user
    if (!user) throw new Error('User is not authenticated'); // Stops execution if no user is logged in
    if (!streamApiKey) throw new Error('Stream API key secret is missing');  // Ensures the public Stream API key exists
    if (!streamSecretKey) throw new Error('Stream API secret is missing');  // Ensures the private Stream secret key exists

    const client = new StreamClient(streamApiKey, streamSecretKey); // Creates a Stream client using the API key and secret (server-side only)
    const userId: string = user.id; // Extracts the Clerk user ID and explicitly types it as a string

    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = client.generateUserToken({ 
        user_id: userId,
        validity_in_seconds: 3600, // Optional: set validity
        iat: issuedAt
    });
    console.log(`Token generated for user: ${userId}`);
    return token;
    // Returns the generated token as a string
}