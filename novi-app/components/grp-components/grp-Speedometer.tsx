'use client' // Declare as a client component for browser-side execution

// Import the external speedometer component library
import ReactSpeedometer from 'react-d3-speedometer';

// Define the props required by the GroupSpeedometer component
type SpeedometerProps = {
  averageDistractionPct: number; // The mean distraction value for the group
  distractedCount: number;       // Number of specifically distracted users
  totalCount: number;            // Total active users being tracked
};

// Main GroupSpeedometer component definition
export default function GroupSpeedometer({ averageDistractionPct, distractedCount, totalCount }: SpeedometerProps) {
  // Ensure the distraction percentage stays within the bounds of 0 to 100
  const clamped = Math.max(0, Math.min(100, averageDistractionPct));

  // Helper function to determine the color of the speedometer needle
  // Color indicates severity: green (low) → yellow (moderate) → red (high)
  const getColor = (pct: number) => {
    if (pct < 30) return '#22c55e';  // green color for safe levels
    if (pct < 60) return '#eab308';  // yellow color for warning levels
    return '#ef4444';                // red color for critical distraction
  };

  // Determine the current color based on the clamped percentage
  const color = getColor(clamped);

  return (
    // Wrapper div to center the speedometer horizontally
    <div className="flex flex-col items-center">
      {/* Configure and render the actual SVG speedometer */}
      <ReactSpeedometer
        key={color}                          // Force re-render when color changes to update needle color
        value={clamped}                      // The percentage value to point at
        minValue={0}                         // Bottom of the scale
        maxValue={100}                       // Top of the scale
        width={240}                          // SVG width in pixels
        height={160}                         // SVG height in pixels
        needleColor={color}                  // Dynamic needle color based on value
        startColor="#22c55e"                 // Starting color of the generic gauge bar (unused with segmentColors)
        endColor="#ef4444"                   // Ending color of the generic gauge bar
        segments={3}                         // Split the gauge arc into 3 sections
        segmentColors={['#22c55e', '#eab308', '#ef4444']} // Specific colors for the 3 sections (green, yellow, red)
        ringWidth={28}                       // Thickness of the gauge arc
        needleHeightRatio={0.7}              // Length of the needle relative to the radius
        needleTransitionDuration={0}         // Remove animation duration for immediate needle updates
        currentValueText=""                  // Hide the default value text inside the SVG
        textColor="transparent"              // Make any leftover default text invisible
      />

      {/* Custom label displaying the numerical distraction percentage */}
      <div className="text-center -mt-4">
        {/* Dynamic percentage text with matching severity color */}
        <div className="text-2xl font-bold" style={{ color }}>
          {clamped.toFixed(0)}%
        </div>
        {/* Subtitle describing the percentage */}
        <div className="text-xs text-gray-400 mt-0.5">Distraction Level</div>
      </div>

      {/* Row displaying the count statistics beneath the speedometer */}
      <div className="mt-3 flex items-center gap-3 text-sm">
        {/* Number of distracted participants highlighted in red */}
        <span className="text-red-400 font-semibold">{distractedCount} distracted</span>
        {/* Decorative separator dot */}
        <span className="text-gray-600">·</span>
        {/* Total number of current participants */}
        <span className="text-gray-400">{totalCount} total</span>
      </div>
    </div>
  );
}