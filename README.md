# DrowseGuard - Driver Drowsiness Detection

DrowseGuard is a browser-based driver fatigue monitoring app built with React, TypeScript, and MediaPipe Face Landmarker. It uses webcam input to track facial landmarks, estimate eye closure through Eye Aspect Ratio (EAR), and trigger progressive alert states when prolonged drowsiness is detected.

## Features

- Real-time webcam-based face landmark tracking
- Eye Aspect Ratio (EAR) calculation for eye-closure detection
- Mouth Aspect Ratio (MAR) calculation for mouth movement/yawn signal display
- Progressive states: Awake, Warning, Drowsy, Emergency
- Sound and voice alert toggles
- Camera device selection
- Adjustable EAR threshold
- Local session history using browser `localStorage`
- Responsive dashboard for desktop, tablet, and mobile

## How It Works

```text
Webcam input
  -> MediaPipe Face Landmarker
  -> EAR / MAR calculation
  -> State classification
  -> Alerts and dashboard feedback
  -> Optional local session save
```

The app runs detection in the browser. It does not require a backend server, database, or cloud API for the core detection flow.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- MediaPipe Tasks Vision
- Web Speech API
- Browser localStorage

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Detection Notes

The app detects facial landmarks and computes drowsiness signals from face geometry. It does not detect nerves, brain activity, or medical fatigue directly. Accuracy depends on camera quality, face visibility, lighting, head position, and the selected EAR threshold.

## EAR Threshold

The EAR threshold controls when eye closure is treated as a drowsiness signal. Lower values are stricter and may detect fewer closures. Higher values are more sensitive and may create more warnings. The dashboard setting updates the active threshold used by the detection loop.
