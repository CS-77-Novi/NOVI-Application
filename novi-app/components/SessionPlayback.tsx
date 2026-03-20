'use client'

import { useState } from 'react'
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import { RefreshCw, Circle, Square, Play, X } from 'lucide-react'

const SessionPlayback = () => {
    const call = useCall()
    const { useIsCallRecordingInProgress } = useCallStateHooks()
    const isRecording = useIsCallRecordingInProgress()

    return <div>Session Playback</div>
}

export default SessionPlayback