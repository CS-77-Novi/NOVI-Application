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

    return <div>Session Playback</div>
}

export default SessionPlayback