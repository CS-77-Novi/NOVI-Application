'use client'

import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react"
import { tokenProvider } from '@/actions/stream.actions';
import Loading from "@/components/Loading";
const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;


const StreamProvider = ({ children }: { children: ReactNode }) => {

    const [videoClient, setVideoClient] = 
    useState<StreamVideoClient>();
    const { user, isLoaded } = useUser();

    useEffect(() => {

    },[])

}