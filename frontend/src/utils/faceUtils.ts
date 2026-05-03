// Calculate distance between two points
const distance = (p1: any, p2: any) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// Calculate Eye Aspect Ratio
export const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
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
  const d1 = distance(p2, p6);
  const d2 = distance(p3, p5);
  // Horizontal distance
  const d3 = distance(p1, p4);

  const ear = (d1 + d2) / (2.0 * d3);
  return ear;
};

// Calculate Mouth Aspect Ratio (for yawning)
export const calculateMAR = (landmarks: any[]) => {
  // Outer lip indices
  // Top: 13, Bottom: 14
  // Left: 78, Right: 308
  if (!landmarks || landmarks.length === 0) return 0;

  const top = landmarks[13];
  const bottom = landmarks[14];
  const left = landmarks[78];
  const right = landmarks[308];

  const verticalDist = distance(top, bottom);
  const horizontalDist = distance(left, right);

  return verticalDist / horizontalDist;
};

// Indices for Left Eye and Right Eye in MediaPipe Face Mesh
export const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
export const LEFT_EYE = [362, 385, 387, 263, 373, 380];
