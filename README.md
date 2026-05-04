# 🚘 DrowseGuard — Driver Drowsiness Detection System

Real-time driver drowsiness detection system that improves road safety using computer vision and edge AI, running entirely in the browser with zero data transmission.

---

## 🌐 Live Demo

👉 https://drowsiness-detection-eight.vercel.app/

---

## 🎯 Problem Solved

Driver fatigue is one of the leading causes of road accidents. Traditional monitoring systems require expensive hardware or cloud processing, making them inaccessible and privacy-invasive.

---

## 💡 Solution

DrowseGuard uses real-time facial landmark tracking and edge AI to detect driver drowsiness directly in the browser, providing instant alerts without sending any data to external servers.

---

## ✨ Key Features

* Real-time detection using **MediaPipe Face Mesh (478 landmarks)**
* Runs at **~24–30 FPS** using WebAssembly for smooth performance
* Eye Aspect Ratio (EAR) and Mouth Aspect Ratio (MAR) analysis
* Detects blinking, prolonged eye closure, and yawning
* Progressive alert system:

  * Awake 🟢 → Warning 🟡 → Drowsy 🟠 → Emergency 🔴
* Voice alerts using Web Speech API
* Fully client-side execution (privacy-first, zero data transmission)
* Session analytics with backend logging (Node.js + SQLite)

---

## 🧠 How It Works

Webcam Input → Face Landmark Detection (MediaPipe) → EAR/MAR Calculation → State Classification → Alert System → User Feedback

---

## 🏗️ Tech Stack

### Frontend

* React.js (Vite + TypeScript)
* Tailwind CSS + Framer Motion
* Zustand (state management)
* MediaPipe (WebAssembly)

### Backend

* Node.js + Express
* SQLite (session logging)

---

## 🧩 Architecture

```id="dzgarch"
Frontend (React) → Webcam Stream → MediaPipe Processing → Feature Calculation (EAR/MAR) → State Detection → Alerts  
                                      ↓  
                                  Backend API → Session Logs (SQLite)
```

---

## 🚀 Run Locally

```bash id="dzg1"
npm run install:all
npm run dev
```

---

Open:
👉 http://localhost:5173

---

## 📊 Performance

* Real-time processing at **~24–30 FPS**
* Uses **478 facial landmarks** for high accuracy
* Zero-latency inference (edge computation in browser)

---

## 📁 Project Structure

* `/frontend` → React application (UI + detection logic)
* `/backend` → Node.js API for session tracking
* `/utils` → EAR/MAR calculations

---

## 🔮 Future Improvements

* Head pose estimation (pitch/yaw/roll detection)
* Driver profile system with authentication
* PDF analytics report export
* Docker-based cloud deployment

---

## 🎯 Impact

* Helps reduce accidents caused by driver fatigue
* Demonstrates real-time edge AI in web applications
* Combines computer vision, frontend systems, and backend analytics

---

*Built for real-world safety. Edge-powered. Privacy-first.*
