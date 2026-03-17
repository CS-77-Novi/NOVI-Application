'use client'

// Import necessary React hooks for managing state and side effects
import { useEffect, useRef, useState } from 'react'

// Define the shape of the options object passed into the custom hook
interface UseDistractionDetectionOptions {
  videoStream: MediaStream | null | undefined // The raw media stream from the local webcam
  meetingId: string // Unique identifier for the current meeting
  participantId: string // Unique identifier for the local participant
  name: string // Display name of the local participant
  isCameraOn: boolean // Flag indicating whether the camera is currently active
}

/**
 * useDistractionDetection
 *
 * A custom React hook that runs combined.js distraction detection locally on the participant's webcam.
 * It accepts a MediaStream (e.g., from Stream.io's useLocalParticipant) rather than a direct
 * video element reference, allowing it to work cleanly within environments where the video
 * tags are managed externally by a provider.
 *
 * All cumulative counters and smoothing mechanics are kept client-side to act as a
 * stateless relay, minimizing server load while preventing false positives.
 */
const useDistractionDetection = ({
  videoStream,
  meetingId,
  participantId,
  name,
  isCameraOn,
}: UseDistractionDetectionOptions) => {
  // Exposed state variables for consuming components (e.g., rendering a local dashboard)
  const [stats, setStats] = useState<any>(null) // Raw frame analysis results from the ML model
  const [focusedCount, setFocusedCount] = useState(0) // Total historically focused frames
  const [totalCount, setTotalCount] = useState(0) // Total historic frames analyzed successfully

  // Refs for tracking internal timers and animation frame lifecycles
  const rafRef = useRef<number | null>(null) // Holds the active requestAnimationFrame ID
  const lastPostRef = useRef<number>(0) // Timetsamp of the last database network request
  const initializedRef = useRef(false) // Flag to prevent multiple initializations of the ML model
  
  // Ref holding the dynamically loaded ML detection function
  const detectRef = useRef<
    ((video: HTMLVideoElement, w: number, h: number, ts: number) => { status: string } | null) | null
  >(null)

  // Internal hidden video element constructed dynamically
  // Since Stream.io doesn't expose a video ref directly, we stream the webcam data 
  // into an invisible DOM element specifically tailored for the ML prediction model
  const videoElRef = useRef<HTMLVideoElement | null>(null)

  // Client-side cumulative counters
  // Track total session metrics for the user persistently without relying on React renders
  const totalChecksRef = useRef(0)
  const distractedChecksRef = useRef(0)
  // Track the highest continuous distraction percentage hit during the active session
  const peakDistractionPctRef = useRef(0)
  const peakDistractionTimeRef = useRef(0)

  // NO FACE smoothing mechanism
  // We only report a "NO FACE" event to the backend/UI after 'N' consecutive missing frames.
  // This helps prevent brief moments (e.g., sneezing, looking down at a phone quickly) 
  // from instantly snapping the user's status to "NO FACE" and causing UI flickering or unfair metrics.
  const consecutiveNoFaceRef = useRef(0)
  const lastKnownStatusRef = useRef<'FOCUSED' | 'DISTRACTED' | null>(null)
  const NO_FACE_THRESHOLD = 8 // Wait for ~8 consecutive misses (~1.6 seconds at 200ms intervals)

  // ── 1. Init combined.js (once) ──────────────────────────────────────────────
  // This effect dynamically loads the machine learning dependencies so it doesn't
  // block the initial page load, and bootstraps the internal detection function.
  useEffect(() => {
    // Cannot initialize without proper routing context variables
    if (!meetingId || !participantId) return

    let cancelled = false // Guard against unmounting during the async load

    const init = async () => {
      try {
        // Dynamically import the combined tracking functions
        const mod = await import('@/ml-calculations/combined')
        if (cancelled) return
        
        // Wait for MediaPipe components to fully spin up
        await mod.initDistraction()
        
        // Store the resolver function and mark as ready
        detectRef.current = mod.detectDistraction
        initializedRef.current = true
      } catch (err) {
        console.error('[DistractionDetection] init failed:', err)
      }
    }

    init()

    // Cleanup phase when the hook unmounts (e.g. user leaves the room layout)
    return () => {
      cancelled = true
      // Stop the scanning loop
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      
      // Destroy the hidden video element context
      if (videoElRef.current) {
        videoElRef.current.srcObject = null
        videoElRef.current = null
      }
      
      // Fire a parting API call to remove this participant's row from the active Supabase metrics
      fetch(`/api/meeting/${meetingId}/distraction?participantId=${participantId}`, {
        method: 'DELETE',
        keepalive: true, // Ensure the request completes even as the tab closes/navigates
      }).catch(() => {})
    }
  }, [meetingId, participantId])

  // ── 2. Attach / detach stream to internal video element ─────────────────────
  // This effect is responsible for routing the camera data into the hidden video tag
  // so the ML model has frames to process without stealing the UI stream instance.
  useEffect(() => {
    // Create the hidden element on the first pass
    if (!videoElRef.current) {
      const el = document.createElement('video')
      el.autoplay = true
      el.playsInline = true
      el.muted = true // Must be muted for autoplay to work seamlessly in modern browsers
      videoElRef.current = el
    }
    const el = videoElRef.current

    if (videoStream && videoStream.getTracks().length > 0) {
      try {
        // Clone the stream so the external UI provider keeps its original reference undisturbed
        const cloned = videoStream.clone()
        el.srcObject = cloned
        
        // Start hidden playback silently
        el.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('[DistractionDetection] Video play failed:', err)
          }
        })

        // Teardown the cloned stream on unmount or source change
        return () => {
          cloned.getTracks().forEach((t) => t.stop())
          el.srcObject = null
        }
      } catch (err) {
        console.warn('[DistractionDetection] Failed to clone or play video stream:', err)
      }
    } else {
      // Clear out the element if no stream is currently provided
      el.srcObject = null
    }
  }, [videoStream])

  // ── 3. Detection loop (runs whenever camera is on) ──────────────────────────
  // The core application loop governing the ML parsing and API throttling.
  // Runs near 60fps, feeding frames into MediaPipe and relaying smoothed data to Supabase.
  useEffect(() => {
    // Do not run the loop if explicitly toggled off (saves battery/CPU)
    if (!isCameraOn) return

    const loop = (timestamp: number) => {
      const video = videoElRef.current
      
      // Gate check: Does everything exist, is it initialized, and does video have display dimensions?
      if (
        initializedRef.current &&
        detectRef.current &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0
      ) {
        // Evaluate the raw image buffer against our posture/gaze models
        const result = detectRef.current(video, video.videoWidth, video.videoHeight, timestamp)

        // Pass the raw result directly back to the consuming component (e.g. local debug dashboard)
        setStats(result)

        // Throttle database synchronization logic: 
        // Only POST to the backend route roughly every 200ms to prevent flooding
        // while remaining close to real-time.
        if (result && timestamp - lastPostRef.current > 200) {
          lastPostRef.current = timestamp

          let status = result.status as 'FOCUSED' | 'DISTRACTED' | 'NO FACE' | 'ERROR'

          // Smoothing routine for transient missing frames/glitches
          if (status === 'NO FACE') {
            consecutiveNoFaceRef.current += 1
            // If we haven't hit the threshold yet, hallucinate the last known valid state
            if (
              consecutiveNoFaceRef.current < NO_FACE_THRESHOLD &&
              lastKnownStatusRef.current !== null
            ) {
              status = lastKnownStatusRef.current
            }
          } else {
            // We found a face! Reset the miss counter and update the last known valid state
            consecutiveNoFaceRef.current = 0
            if (status === 'FOCUSED' || status === 'DISTRACTED') {
              lastKnownStatusRef.current = status
            }
          }

          // Manage aggregate lifetime activity counters
          if (status === 'FOCUSED' || status === 'DISTRACTED') {
            totalChecksRef.current += 1
            if (status === 'DISTRACTED') distractedChecksRef.current += 1

            // Sync refs to React state so the parent component can render them
            setTotalCount(totalChecksRef.current)
            setFocusedCount(totalChecksRef.current - distractedChecksRef.current)
            
            // Note: Error boundaries or raw missing "NO FACE" events do NOT increment these counters,
            // so intermittent network glitches or walking away entirely don't artificially skew the ratio.
          }

          // Derive local stats context for the database payload
          const total = totalChecksRef.current
          const distracted = distractedChecksRef.current
          const currentPct = total > 0 ? Math.round((distracted / total) * 100) : 0

          // Update peak values if out-performed on this tick
          if (currentPct > peakDistractionPctRef.current) {
            peakDistractionPctRef.current = currentPct
            peakDistractionTimeRef.current = Date.now()
          }

          // Transmit the aggregated telemetry payload to the Next.js API layer
          // which will forward it gracefully to Supabase
          fetch(`/api/meeting/${meetingId}/distraction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId,
              name,
              status,
              totalChecks: total,
              distractedChecks: distracted,
              peakDistractionPct: peakDistractionPctRef.current,
              peakDistractionTime: peakDistractionTimeRef.current,
            }),
          }).catch(() => {}) // Catch network errors silently to avoid console spam
        }
      }

      // Schedule the next frame iteration natively tied to monitor refresh rate
      rafRef.current = requestAnimationFrame(loop)
    }

    // Kick off the initial loop
    rafRef.current = requestAnimationFrame(loop)

    // Cleanup phase: cancel pending calculations if the dependencies shift or unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isCameraOn, meetingId, participantId, name]) // Re-run effect safely when user toggles hardware config or re-names

  // Return the raw frame data and derived session totals structurally
  return { stats, focusedCount, totalCount }
}

export default useDistractionDetection