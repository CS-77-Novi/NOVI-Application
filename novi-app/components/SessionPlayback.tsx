'use client'

import { useState } from 'react'
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

    return <div>Session Playback</div>
}

export default SessionPlayback