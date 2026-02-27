import { useCallback, useEffect, useRef, useState } from 'react'

// Interface defining the statistics for a single participant's distraction levels
export interface ParticipantDistractionStat {
  participantId: string          // Unique identifier for the participant
  name: string                   // Display name of the participant
  totalChecks: number            // Total number of distraction checks performed
  distractedChecks: number       // Number of checks where the participant was distracted
  distractionPct: number         // Current distraction percentage
  peakDistractionPct: number     // Highest distraction percentage recorded during the session
  peakDistractionTime: number    // Timestamp (epoch ms) when the peak distraction occurred
}

// Interface defining the aggregated distraction data for the entire group
interface GroupDistractionData {
  distractedCount: number                    // Number of highly distracted participants
  totalCount: number                         // Total number of active participants
  participants: ParticipantDistractionStat[] // Array of individual participant stats
}

// Duration (in ms) to hold stale data before removing a participant from the list
const HOLD_STALE_MS = 3000

/**
 * Custom hook to manage and poll group distraction statistics.
 * Fetches data from the server every 200ms and smooths out momentary gaps.
 */
const useGroupDistraction = (meetingId: string, hostUserId?: string): GroupDistractionData => {
  // State to hold the aggregated group distraction data
  const [data, setData] = useState<GroupDistractionData>({
    distractedCount: 0,
    totalCount: 0,
    participants: [],
  })

  // Ref to track last-known participant stats and timestamps to prevent flickering
  const knownRef = useRef<Map<string, { stat: ParticipantDistractionStat; lastSeenAt: number }>>(
    new Map()
  )

  // Callback function to fetch distraction data from the API
  const fetchData = useCallback(async () => {
    if (!meetingId) return // Abort if no meeting ID is provided

    try {
      // Fetch distraction data for the specific meeting
      const res = await fetch(`/api/meeting/${meetingId}/distraction`)
      const json = await res.json()

      const now = Date.now() // Get current timestamp
      const fresh: ParticipantDistractionStat[] = json.participants ?? [] // Extract fresh participant data

      // Update the knownRef map with the newly fetched participants and current timestamp
      for (const stat of fresh) {
        knownRef.current.set(stat.participantId, { stat, lastSeenAt: now })
      }

      // Remove participants from the map if they haven't been seen for longer than HOLD_STALE_MS
      for (const [id, entry] of knownRef.current.entries()) {
        if (now - entry.lastSeenAt > HOLD_STALE_MS) {
          knownRef.current.delete(id)
        }
      }

      // Convert the map to an array and filter out the host user (if specified)
      const merged = Array.from(knownRef.current.values())
        .map((e) => e.stat)
        .filter((p) => !hostUserId || p.participantId !== hostUserId)

      let distractedCount = 0 // Initialize count of highly distracted participants
      
      // Calculate how many participants exceed the 50% distraction threshold
      for (const p of merged) {
        if (p.distractionPct >= 50) distractedCount++
      }

      // Update state with the newly computed counts and participant list
      setData({
        distractedCount,
        totalCount: merged.length,
        participants: merged,
      })
    } catch {
      // Ignore errors to keep displaying the last known valid data
    }
  }, [meetingId, hostUserId])

  // Effect to perform initial fetch and set up the polling interval
  useEffect(() => {
    fetchData() // Initial data fetch
    const interval = setInterval(fetchData, 200) // Poll every 200ms
    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [fetchData])

  return data // Return the current distraction data
}

export default useGroupDistraction