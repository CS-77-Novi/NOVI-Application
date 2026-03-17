// Import initialization and update functions for head posture tracking
import {
  initHeadPosture,
  updateHeadPosture
} from "./headPosture.js";

// Import update function for eye gaze tracking
import { updateGaze } from "./gaze.js";

// Import MediaPipe Task Vision dependencies for facial landmarks
import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

/* ----------------------------------------
   Internal state
---------------------------------------- */
// Reusing landmarker from headPosture.js

/* ----------------------------------------
   Public API
---------------------------------------- */

// Asynchronously initializes the overall distraction tracking system
export async function initDistraction() {
  // Wait for the head posture tracker to initialize its own model
  // This now serves as the single source for facial landmarks
  await initHeadPosture();
  return true;
}

// Runs a combined check for distraction by sequentially evaluating posture then gaze
export function detectDistraction(video, width, height, timestamp) {
  try {
    // Validate that the video element is provided and has enough data to be parsed
    if (!video || video.readyState < 2) {
      return null;
    }

    // Validate that proper dimensions are provided for the calculations
    if (!width || !height || width === 0 || height === 0) {
      return null;
    }

    // Step 1: Execute head posture tracking analysis
    // This function now returns both the posture result and the raw landmarks
    const headResult = updateHeadPosture(video, width, height, timestamp);

    // If the head tracker couldn't find a face, short-circuit and return "NO FACE"
    if (!headResult || headResult.status === "NO FACE") {
      return {
        status: "NO FACE",
        headPosture: null,
        gaze: null
      };
    }

    // Step 2: Gaze detection phase
    // We reuse the landmarks already detected by the posture phase to save performance
    let gazeResult = null;
    let finalStatus = headResult.status;

    // Proceed to check gaze only if the user's head is "FOCUSED" and landmarks are available
    if (headResult.status === "FOCUSED" && headResult.landmarks) {
      // Compute gaze tracking ratios using the existing landmarks
      gazeResult = updateGaze(
        headResult.landmarks,
        width,
        height
      );

      // If the eye gaze is pointing anywhere other than "CENTER", user is distracted
      if (gazeResult && gazeResult.gaze !== "CENTER") {
        finalStatus = "DISTRACTED";
      }
    }

    // Construct and return the final combined response object for this frame
    return {
      status: finalStatus, // Outcome status: "FOCUSED", "DISTRACTED", or "NO FACE"
      headPosture: {
        yaw: headResult.yaw,   // Head rotation around vertical axis
        pitch: headResult.pitch // Head rotation around lateral axis
      },
      gaze: gazeResult 
    };
  } catch (err) {
    // Suppress expected transient errors regarding the video element's state
    if (err.message?.includes('video') || err.message?.includes('ready') || err.message?.includes('landmarker')) {
      return null;
    }
    // Log unexpected exceptions for debugging
    console.error("Error in distraction detection:", err);
    
    // Return a safe error state payload
    return {
      status: "ERROR",
      headPosture: null,
      gaze: null
    };
  }
}
