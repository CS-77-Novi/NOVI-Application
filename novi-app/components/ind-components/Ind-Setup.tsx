'use client';

import { useState, useEffect, useRef } from 'react';
import { VideoCameraIcon, VideoCameraSlashIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

interface IndSetUpProps {
    onJoinRoom: () => void;
    isVideoEnabled: boolean;
    setIsVideoEnabled: (enabled: boolean) => void;
    isAudioEnabled: boolean;
    setIsAudioEnabled: (enabled: boolean) => void;
}

const IndSetUp = ({ 
    onJoinRoom, 
    isVideoEnabled, 
    setIsVideoEnabled, 
    isAudioEnabled, 
    setIsAudioEnabled
}: IndSetUpProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Get available media devices
    const getDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            
            setVideoDevices(videoInputs);
            setAudioDevices(audioInputs);
            
            if (videoInputs.length > 0 && !selectedVideoDevice) {
                setSelectedVideoDevice(videoInputs[0].deviceId);
            }
            if (audioInputs.length > 0 && !selectedAudioDevice) {
                setSelectedAudioDevice(audioInputs[0].deviceId);
            }
        } catch (err) {
            console.error('Error enumerating devices:', err);
            setError('Failed to get media devices');
        }
    };

    // Start media stream
    const startMediaStream = async () => {
        try {
            // Stop existing stream first
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: isVideoEnabled ? {
                    deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false,
                audio: isAudioEnabled ? {
                    deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setMediaStream(stream);

            // Attach video stream to video element
            if (videoRef.current && isVideoEnabled) {
                videoRef.current.srcObject = stream;
            }

            setError('');
        } catch (err: any) {
            console.error('Error accessing media devices:', err);
            setError(err.message || 'Failed to access camera/microphone');
        }
    };

    // Toggle video
    const toggleVideo = () => {
        setIsVideoEnabled(!isVideoEnabled);
    };

    // Toggle audio
    const toggleAudio = () => {
        setIsAudioEnabled(!isAudioEnabled);
    };

    // Change video device
    const handleVideoDeviceChange = (deviceId: string) => {
        setSelectedVideoDevice(deviceId);
    };

    // Change audio device
    const handleAudioDeviceChange = (deviceId: string) => {
        setSelectedAudioDevice(deviceId);
    };

    // Initialize devices on mount
    useEffect(() => {
        getDevices();
        
        // Request permissions to get device labels
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
                getDevices();
            })
            .catch(err => console.error('Permission error:', err));

        return () => {
            // Cleanup on unmount
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Update stream when settings change
    useEffect(() => {
        if (isVideoEnabled || isAudioEnabled) {
            startMediaStream();
        } else {
            // Stop stream if both are disabled
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                setMediaStream(null);
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
        }
    }, [isVideoEnabled, isAudioEnabled, selectedVideoDevice, selectedAudioDevice]);

    const handleJoinMeeting = () => {
        // Clean up media stream before joining
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        onJoinRoom();
    };

    return (
            <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden py-12 px-4 sm:px-8">
            {/* Animated Background Blobs in Novi Brand Colors */}
            <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none"></div>
            <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="z-10 w-full max-w-4xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 md:p-12 border border-white/50 dark:border-gray-700/50 transition-colors duration-300">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                        Device <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Setup</span>
                    </h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Check your camera and microphone before joining the session.</p>
                </div>  

                {/* Video Preview */}
                <div className="relative mb-10 rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800" style={{ backgroundColor: '#111827', aspectRatio: '16/9' }}>
                    {isVideoEnabled ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                                <VideoCameraSlashIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 font-medium">Camera is off</p>
                        </div>
                    )}
                    
                    {/* Video Controls Overlay */}
                         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center">
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg 
                            ${isVideoEnabled ? 'bg-cyan-500 shadow-cyan-500/40' : 'bg-red-500 shadow-red-500/40'}`}
                            
                        >
                            {isVideoEnabled ? (
                                <VideoCameraIcon className="w-7 h-7 text-white" />    
                            ) : (
                                <VideoCameraSlashIcon className="w-7 h-7 text-white" />
                            )}
                        </button>
                        
                    </div>
                </div>

                {/* Device Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-white/40 dark:border-white/5">
                    {/* Camera Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1 tracking-wide">
                            Camera
                        </label>
                        <div className="relative">
                            <select
                                value={selectedVideoDevice}
                                onChange={(e) => handleVideoDeviceChange(e.target.value)}
                                className="w-full px-5 py-3.5 appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
                                disabled={videoDevices.length === 0}
                            >
                                {videoDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>    
                
                    </div>

                    
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* Join Options */}
                <div className="mb-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!isVideoEnabled && !isAudioEnabled}
                            onChange={() => {
                                if (isVideoEnabled || isAudioEnabled) {
                                    setIsVideoEnabled(false);
                                    setIsAudioEnabled(false);
                                } else {
                                    setIsVideoEnabled(true);
                                    setIsAudioEnabled(true);
                                }
                            }}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">Join with mic and camera off</span>
                    </label>
                </div>

                {/* Join Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleJoinMeeting}
                        className="px-12 py-4 text-lg font-semibold text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#3B82F6' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3B82F6';
                        }}
                    >
                        Join Learning Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IndSetUp;
