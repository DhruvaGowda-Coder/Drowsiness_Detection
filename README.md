# 🚘 DrowseGuard: Driver Drowsiness Detection System

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=Dashboard+Preview)

A full-stack, production-ready web application that detects driver drowsiness in real-time using advanced facial landmark detection. Built with React, Node.js, and MediaPipe, this system runs edge AI directly in the browser with zero latency.

### Original Concept
> This project deals with vehicle drivers, especially car or truck drivers. It helps keep drivers awake while driving. If the driver falls asleep, our face/emotion detector recognizes the person and sends a signal to wake them up. If it fails to wake them up and the AI has access to the car controls, it can slowly stop the vehicle after signaling two or three times.

---

## ✨ Core Features

- **Real-Time Edge Detection:** Utilizes Google's MediaPipe Face Mesh to track 478 facial landmarks directly in the browser via WebRTC at 30+ FPS.
- **Eye & Mouth Aspect Ratio Analysis:** Calculates EAR (Eye Aspect Ratio) and MAR (Mouth Aspect Ratio) continuously to detect blinking, prolonged eye closure, and yawning.
- **Smart Alert System:**
  - **Progressive Warnings:** Transitions dynamically from Awake 🟢 → Warning 🟡 → Drowsy 🟠 → Emergency 🔴 based on threshold timings.
  - **Voice & Audio Alerts:** Uses Web Speech API for natural voice warnings and fallback auditory alarms.
  - **Emergency Mode:** Simulates an emergency pull-over protocol if the driver remains unresponsive.
- **Session Analytics:** Backend integration (Node.js + Express + SQLite) to save trip logs, blink counts, and warning occurrences for post-trip review.
- **Modern UI:** Glassmorphism dashboard built with Tailwind CSS, fully responsive, featuring a dark-mode optimized interface.

## 🧱 Tech Stack

### Frontend
- **Framework:** React.js (Vite + TypeScript)
- **Styling:** Tailwind CSS + Framer Motion
- **State Management:** Zustand
- **AI/CV:** `@mediapipe/tasks-vision` (WebAssembly)
- **Routing:** React Router DOM

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3
- **Middleware:** CORS, Body-Parser

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution
To get the application running locally in one step, clone the repository and run:

```bash
npm run install:all
npm run dev
```

*This will concurrently start the Express API on port `3001` and the Vite React app on port `5173`.*

Open your browser and navigate to: `http://localhost:5173`

---

## 🏗️ Architecture

```
driver-drowsiness-system/
├── backend/                  # Node.js API server
│   ├── server.js             # Express API endpoints
│   ├── package.json          
│   └── sessions.db           # SQLite database (auto-generated)
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       
│   │   ├── pages/            # Landing and Dashboard
│   │   ├── store/            # Zustand state management
│   │   ├── utils/            # Face detection math (EAR/MAR)
│   │   ├── App.tsx           
│   │   └── main.tsx          
│   ├── tailwind.config.js    
│   └── vite.config.ts        
├── package.json              # Root package to manage both apps
└── README.md
```

## 🔮 Future Improvements

- [ ] Add explicit Head Pose Estimation (Pitch/Yaw/Roll) to detect head nodding.
- [ ] Implement user authentication to associate sessions with specific driver profiles.
- [ ] Add PDF report generation using `jspdf` to export session analytics.
- [ ] Containerize with Docker for simplified cloud deployment on AWS/GCP.

---

*Built for maximum road safety. Edge-computed. Privacy-first.*
