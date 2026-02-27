'use client' // Mark component for client-side rendering

// Import necessary icons from Heroicons
import { XMarkIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
// Import dynamic loading from Next.js
import dynamic from 'next/dynamic'
// Import the custom hook to fetch group distraction data
import useGroupDistraction from '@/hooks/useGroupDistraction'

// Dynamically import GroupSpeedometer with SSR disabled to prevent hydration errors
const GroupSpeedometer = dynamic(() => import('./grp-Speedometer'), { ssr: false })

// Define the component's props interface
type Props = {
  meetingId: string       // ID of the active meeting
  hostUserId?: string     // Optional ID of the host user to exclude from stats
  isOpen: boolean         // Controls whether the dashboard is visible
  onClose: () => void     // Callback to close the dashboard
}

// Threshold percentage to classify a participant as "highly distracted"
const DISTRACTION_THRESHOLD = 75

// Main GroupDashboard component definition
export default function GroupDashboard({ meetingId, hostUserId, isOpen, onClose }: Props) {
  // Fetch distraction data using the custom hook
  const { distractedCount, totalCount, participants } = useGroupDistraction(meetingId, hostUserId)

  // Do not render anything if the dashboard is closed
  if (!isOpen) return null

  // Filter out highly distracted participants based on threshold and minimum checks, sorted descending
  const highlyDistracted = participants
    .filter((p) => p.totalChecks >= 10 && p.distractionPct >= DISTRACTION_THRESHOLD)
    .sort((a, b) => b.distractionPct - a.distractionPct)

  return (
    // Main dashboard container with styling for blur, borders, and shadows
    <div
      className="
        flex flex-col h-full
        w-72 flex-shrink-0
        bg-gray-900/95 backdrop-blur-md
        rounded-2xl
        border border-gray-700/50
        shadow-2xl
        overflow-hidden
      "
    >
      {/* Header section containing title and close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Dashboard Icon */}
          <ChartBarIcon className="w-4 h-4 text-purple-400" />
          {/* Dashboard Title */}
          <span className="text-white font-semibold text-sm">Group Dashboard</span>
        </div>
        {/* Close button with hover effects */}
        <button
          onClick={onClose}
          aria-label="Close dashboard"
          className="w-6 h-6 rounded-full flex items-center justify-center
            text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-150"
        >
          {/* Close Icon */}
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable body section for varying amounts of content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ── Speedometer section for group averages ── */}
        <div className="flex items-center justify-center px-4 py-5 border-b border-gray-700/50">
          {totalCount === 0 ? (
            // Placeholder text when no participants are present
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Waiting for participants…</p>
              <p className="text-gray-600 text-xs mt-1">Detection starts when cameras are on</p>
            </div>
          ) : (
            // Render the speedometer when data is available
            <GroupSpeedometer
             averageDistractionPct={
                // Calculate average distraction across all active participants
                totalCount > 0
                  ? participants.reduce((sum, p) => sum + p.distractionPct, 0) / totalCount
                  : 0
              }
              distractedCount={distractedCount} // Pass heavily distracted count
              totalCount={totalCount}           // Pass total participant count
            />
          )}
        </div>

        {/* ── Distracted Participants list section ── */}
        <div className="px-3 py-3">
          {/* Section header with icon and threshold label */}
          <div className="flex items-center gap-1.5 mb-2">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Distracted Participants
            </span>
            <span className="ml-auto text-[10px] text-gray-600">&gt;{DISTRACTION_THRESHOLD}%</span>
          </div>

          {/* Conditional rendering based on participant data states */}
          {totalCount === 0 ? (
            // State when no data has been received at all
            <p className="text-gray-600 text-xs text-center py-3">No data yet</p>
          ) : highlyDistracted.length === 0 ? (
            // State when data exists but nobody is highly distracted
            <p className="text-green-500/70 text-xs text-center py-3">
              ✓ No highly distracted participants
            </p>
          ) : (
            // List of highly distracted participants
            <div className="space-y-1.5">
              {highlyDistracted.map((p) => (
                // Individual participant row
                <div
                  key={p.participantId}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  {/* Participant Avatar (Initial) */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-600
                    flex items-center justify-center flex-shrink-0 shadow">
                    <span className="text-white text-[10px] font-bold uppercase">
                      {p.name.charAt(0)}
                    </span>
                  </div>

                  {/* Participant Name (truncated if too long) */}
                  <span className="flex-1 text-xs text-white font-medium truncate min-w-0">
                    {p.name}
                  </span>

                  {/* Individual Distraction Percentage */}
                  <span className="text-xs font-bold text-red-400 flex-shrink-0">
                    {p.distractionPct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}