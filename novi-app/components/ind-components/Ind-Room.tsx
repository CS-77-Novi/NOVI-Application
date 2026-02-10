'use client';

import { useState, useEffect, useRef } from 'react';
import { VideoCameraIcon, VideoCameraSlashIcon, MicrophoneIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { initGaze, runGaze } from '@/ml-calculations/gaze';
import Dashboard from './Ind-Dashboard';
import IndEndCallButton from './Ind-EndCallButton';

interface IndRoomProps {
    initialVideoEnabled?: boolean;
    initialAudioEnabled?: boolean;
}

const IndRoom = ({initialVideoEnabled = true, initialAudioEnabled = true }: IndRoomProps = {}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideoEnabled);
    const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudioEnabled);

    // Gaze tracking state
    const [gazeData, setGazeData] = useState<any>(null);
    const [isGazeInitialized, setIsGazeInitialized] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    // Initialize media stream
    const startMediaStream = async (enableVideo: boolean, enableAudio: boolean) => {
        try {
            // Stop existing stream first
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: enableVideo ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false,
                audio: enableAudio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setMediaStream(stream);

            // Attach video stream to video element
            if (videoRef.current && enableVideo) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        const newVideoState = !isVideoEnabled;
        setIsVideoEnabled(newVideoState);

        // Clear gaze data when camera is turned off
        if (!newVideoState) {
            setGazeData(null);
        }
        
        if (mediaStream) {
            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = newVideoState;
                
                // Update video element srcObject when re-enabling
                if (newVideoState && videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }
        }
    };

    // Toggle audio
    const toggleAudio = () => {
        const newAudioState = !isAudioEnabled;
        setIsAudioEnabled(newAudioState);
        
        if (mediaStream) {
            const audioTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = newAudioState;
            }
        }
    };

    // Handle end session - cleanup and close
    const handleEndCall = () => {
        // Stop all media tracks
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        // Cancel gaze detection animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    // Initialize on mount
    useEffect(() => {
        startMediaStream(true, true);

        return () => {
            // Cleanup on unmount
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Update video element when isVideoEnabled changes
    useEffect(() => {
        if (videoRef.current && mediaStream && isVideoEnabled) {
            // Set srcObject when video element is mounted and video is enabled
            videoRef.current.srcObject = mediaStream;
        }
    }, [isVideoEnabled, mediaStream]);

    // Initialize gaze tracking
    useEffect(() => {
        const setupGaze = async () => {
            try {
                await initGaze();
                setIsGazeInitialized(true);
            } catch (err) {
                console.error('Error initializing gaze tracking:', err);
            }
        };

        setupGaze();
    }, []);

    // Continuous gaze detection loop
    useEffect(() => {
        if (!isGazeInitialized || !videoRef.current || !isVideoEnabled) {
            return;
        }

        const detectGaze = () => {
            if (videoRef.current && isVideoEnabled) {
                const result = runGaze(videoRef.current);
                // Always update state, including null when no face detected
                setGazeData(result);
            }
            animationFrameRef.current = requestAnimationFrame(detectGaze);
        };

        detectGaze();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isGazeInitialized, isVideoEnabled]);

    return (
        <div className="relative flex flex-col h-screen w-full bg-gray-900">
            {/* Main Video Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                    {isVideoEnabled ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover bg-gray-800"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">Camera is off</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navbar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
                <div className="flex items-center justify-center gap-6">
                    {/* Camera Button */}
                    <button
                        onClick={toggleVideo}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: isVideoEnabled ? '#C8A2E0' : '#ef4444' }}
                    >
                        {isVideoEnabled ? (
                            <VideoCameraIcon className="w-6 h-6 text-white" />
                        ) : (
                            <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                        )}
                        <span className="text-white text-sm font-medium">Camera</span>
                    </button>

                    {/* Audio Button */}
                    <button
                        onClick={toggleAudio}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: isAudioEnabled ? '#C8A2E0' : '#ef4444' }}
                    >
                        {isAudioEnabled ? (
                            <MicrophoneIcon className="w-6 h-6 text-white" />
                        ) : (
                            <MicrophoneIcon className="w-6 h-6 text-white" />
                        )}
                        <span className="text-white text-sm font-medium">Audio</span>
                    </button>

                    {/* Dashboard Button */}
                    <button
                        onClick={() => setShowDashboard(!showDashboard)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105 bg-gray-700 hover:bg-gray-600"
                    >
                        <ChartBarIcon className="w-6 h-6 text-white" />
                        <span className="text-white text-sm font-medium">Dashboard</span>
                    </button>

                    {/* End Session Button */}
                    <IndEndCallButton onEndCall={handleEndCall} />
                </div>
            </div>

            {/* Dashboard Overlay */}
            {showDashboard && (
                <Dashboard 
                    stats={gazeData} 
                    isVideoEnabled={isVideoEnabled}
                    onClose={() => setShowDashboard(false)} 
                />
            )}
        </div>
    );
};

export default IndRoom;
