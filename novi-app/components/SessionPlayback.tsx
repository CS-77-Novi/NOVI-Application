'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import { RefreshCw, Circle, Square, Play, X } from 'lucide-react'

interface Recording {
    url: string
    filename: string
    start_time: string
    end_time: string
}

const SessionPlayback = () => {
    const call = useCall()
    const { useIsCallRecordingInProgress } = useCallStateHooks()
    const isRecording = useIsCallRecordingInProgress()

    const [recordings, setRecordings] = useState<Recording[]>([])
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false)
    const [isTogglingRecording, setIsTogglingRecording] = useState(false)
    const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [autoRecordStarted, setAutoRecordStarted] = useState(false)

    // Auto-start recording when component mounts
    useEffect(() => {
        if (!call || autoRecordStarted || isRecording) return

        const autoStart = async () => {
            try {
                setAutoRecordStarted(true)
                await call.startRecording()
            } catch (err: unknown) {
                console.log('Auto-record:', err instanceof Error ? err.message : 'Could not auto-start recording')
                setAutoRecordStarted(true)
            }
        }

        const timer = setTimeout(autoStart, 2000)
        return () => clearTimeout(timer)
    }, [call, autoRecordStarted, isRecording])

    // Fetch recordings
    const fetchRecordings = useCallback(async () => {
        if (!call) return
        setIsLoadingRecordings(true)
        setError(null)

        try {
            const response = await call.queryRecordings()
            const recs = response?.recordings || []
            setRecordings(recs as unknown as Recording[])
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch recordings'
            setError(message)
            console.error('Error fetching recordings:', err)
        } finally {
            setIsLoadingRecordings(false)
        }
    }, [call])

    // Fetch recordings on mount and when recording state changes
    useEffect(() => {
        fetchRecordings()
    }, [fetchRecordings, isRecording])

     // Toggle recording
    const toggleRecording = async () => {
        if (!call) return
        setIsTogglingRecording(true)
        setError(null)

        try {
            if (isRecording) {
                await call.stopRecording()
                setTimeout(fetchRecordings, 3000)
            } else {
                await call.startRecording()
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to toggle recording'
            setError(message)
        } finally {
            setIsTogglingRecording(false)
        }
    }
    // Format time from ISO string
    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString)
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        } catch {
            return 'Unknown'
        }
    }

    // Calculate duration between two ISO strings
    const getDuration = (start: string, end: string) => {
        try {
            const diff = new Date(end).getTime() - new Date(start).getTime()
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            return `${minutes}m ${seconds}s`
        } catch {
            return 'Unknown'
        }
    }

    return (
        <div className="flex flex-col py-2 animate-fade-in">
            {/* Recording status */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isRecording ? (
                        <>
                            <Circle size={10} className="text-red-500 fill-red-500 animate-pulse" />
                            <span className="text-red-400 text-sm font-semibold">Recording</span>
                        </>
                    ) : (
                        <>
                            <Circle size={10} className="text-gray-500 fill-gray-500" />
                            <span className="text-gray-400 text-sm">Not Recording</span>
                        </>
                    )}
                </div>

                <button
                    onClick={toggleRecording}
                    disabled={isTogglingRecording}
                    className={`flex items-center gap-1.5 py-2 px-4 rounded-lg font-semibold text-xs
                    transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50
                    ${isRecording
                        ? 'bg-red-600/80 text-white hover:bg-red-500'
                        : 'bg-green-600/80 text-white hover:bg-green-500'
                    }`}
                >
                    {isTogglingRecording ? (
                        <RefreshCw size={14} className="animate-spin" />
                    ) : isRecording ? (
                        <Square size={14} />
                    ) : (
                        <Circle size={14} className="fill-current" />
                    )}
                    {isTogglingRecording
                        ? 'Processing...'
                        : isRecording
                            ? 'Stop'
                            : 'Record'}
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-3 animate-fade-in">
                    <p className="text-red-300 text-xs">{error}</p>
                </div>
            )}

            {/* Selected recording player */}
            {selectedRecording && (
                <div className="mb-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">
                            Now Playing
                        </p>
                        <button
                            onClick={() => setSelectedRecording(null)}
                            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl overflow-hidden">
                        <video
                            src={selectedRecording}
                            controls
                            autoPlay
                            className="w-full rounded-xl"
                            style={{ maxHeight: '200px' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}

            {/* Recordings list */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">
                        Recordings ({recordings.length})
                    </p>
                    <button
                        onClick={fetchRecordings}
                        disabled={isLoadingRecordings}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1
                        hover:scale-110 active:scale-95"
                        title="Refresh recordings"
                    >
                        <RefreshCw size={14} className={isLoadingRecordings ? 'animate-spin' : ''} />
                    </button>
                </div>

                {isLoadingRecordings && recordings.length === 0 ? (
                    <div className="text-center py-6">
                        <RefreshCw size={20} className="animate-spin text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">Loading recordings...</p>
                    </div>
                ) : recordings.length === 0 ? (
                    <div className="text-center py-6 bg-gray-800/30 rounded-xl">
                        <p className="text-gray-500 text-sm mb-1">No recordings yet</p>
                        <p className="text-gray-600 text-xs">
                            {isRecording
                                ? 'Stop recording to create a playback segment'
                                : 'Start recording to capture the session'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {recordings.map((rec, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedRecording(rec.url)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-left
                                transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                                ${selectedRecording === rec.url
                                    ? 'bg-blue-900/40 border border-blue-500/40'
                                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                ${selectedRecording === rec.url
                                    ? 'bg-blue-600'
                                    : 'bg-gray-700'
                                }`}>
                                    <Play size={14} className="text-white ml-0.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">
                                        Segment {recordings.length - index}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <span>{formatTime(rec.start_time)}</span>
                                        {rec.end_time && (
                                            <>
                                                <span>•</span>
                                                <span>{getDuration(rec.start_time, rec.end_time)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info note */}
            <div className="mt-4 pt-3 border-t border-gray-700/50">
                <p className="text-gray-600 text-[10px] text-center">
                    💡 Recordings take ~30s to process after stopping.
                    Use the refresh button to check for new segments.
                </p>
            </div>
        </div>
    )
    
}

export default SessionPlayback