type LandmarkPoint = {
  x: number;
  y: number;
};

type FrameSize = {
  width: number;
  height: number;
};

const toFramePoint = (point: LandmarkPoint, frameSize?: FrameSize) => ({
  x: frameSize ? point.x * frameSize.width : point.x,
  y: frameSize ? point.y * frameSize.height : point.y
});

// Calculate distance between two points
const distance = (p1: LandmarkPoint, p2: LandmarkPoint, frameSize?: FrameSize) => {
  const a = toFramePoint(p1, frameSize);
  const b = toFramePoint(p2, frameSize);
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

// Calculate Eye Aspect Ratio
export const calculateEAR = (landmarks: LandmarkPoint[], eyeIndices: number[], frameSize?: FrameSize) => {
  // Eye indices typically:
  // [left_corner, top_right, bottom_right, right_corner, bottom_left, top_left]
  // e.g. for right eye: [33, 160, 158, 133, 153, 144]
  
  if (!landmarks || landmarks.length === 0) return 0;
  
  const p1 = landmarks[eyeIndices[0]];
  const p2 = landmarks[eyeIndices[1]];
  const p3 = landmarks[eyeIndices[2]];
  const p4 = landmarks[eyeIndices[3]];
  const p5 = landmarks[eyeIndices[4]];
  const p6 = landmarks[eyeIndices[5]];

  // Vertical distances
  const d1 = distance(p2, p6, frameSize);
  const d2 = distance(p3, p5, frameSize);
  // Horizontal distance
  const d3 = distance(p1, p4, frameSize);
  if (d3 === 0) return 0;

  const ear = (d1 + d2) / (2.0 * d3);
  return ear;
};

// Calculate Mouth Aspect Ratio (for yawning)
export const calculateMAR = (landmarks: LandmarkPoint[], frameSize?: FrameSize) => {
  // Outer lip indices
  // Top: 13, Bottom: 14
  // Left: 78, Right: 308
  if (!landmarks || landmarks.length === 0) return 0;

  const top = landmarks[13];
  const bottom = landmarks[14];
  const left = landmarks[78];
  const right = landmarks[308];

  const verticalDist = distance(top, bottom, frameSize);
  const horizontalDist = distance(left, right, frameSize);
  if (horizontalDist === 0) return 0;

  return verticalDist / horizontalDist;
};

// Indices for Left Eye and Right Eye in MediaPipe Face Mesh
export const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
export const LEFT_EYE = [362, 385, 387, 263, 373, 380];
