import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store/useStore';
import { calculateEAR, calculateMAR, RIGHT_EYE, LEFT_EYE } from '../utils/faceUtils';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Dashboard = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const {
    isTracking, setTracking, earThreshold,
    status, setStatus, addWarning, addEmergency,
    alarmSoundEnabled, voiceAlertEnabled,
    blinkCount, incrementBlink, drowsyWarnings, emergencyStops
  } = useStore();

  const [fps, setFps] = useState(0);
  const [currentEar, setCurrentEar] = useState(0);
  const [currentMar, setCurrentMar] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [trackingStartTime, setTrackingStartTime] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Camera device selection
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');

  const closedFramesRef = useRef(0);
  const lastAlarmTimeRef = useRef(0);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);
  const framesRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  // Fetch available cameras (safe, no forced permissions)
  const refreshCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameras(videoDevices);
      if (videoDevices.length === 0) {
        setCameraError('No camera found. Please connect a webcam.');
      } else {
        setCameraError('');
      }
    } catch (err: any) {
      setCameraError(`Camera enumeration error: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    refreshCameras();
    navigator.mediaDevices.addEventListener('devicechange', refreshCameras);
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshCameras);
  }, [refreshCameras]);

  useEffect(() => {
    const initModel = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      setModelLoaded(true);
    };
    initModel();
  }, []);

  const playAlarm = useCallback(() => {
    if (!alarmSoundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => { osc.frequency.value = 1100; }, 200);
      setTimeout(() => { osc.frequency.value = 880; }, 400);
      setTimeout(() => { osc.stop(); ctx.close(); }, 600);
    } catch(e) {}
  }, [alarmSoundEnabled]);

  const speak = useCallback((text: string) => {
    if (!voiceAlertEnabled) return;
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 1.2; msg.pitch = 1.1;
      window.speechSynthesis.speak(msg);
    }
  }, [voiceAlertEnabled]);

  const detect = useCallback(async () => {
    if (!isTracking || !webcamRef.current || !faceLandmarkerRef.current || !canvasRef.current) return;
    const video = webcamRef.current.video;
    if (video && video.readyState >= 2) {
      framesRef.current++;
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(framesRef.current); framesRef.current = 0; lastFpsTimeRef.current = now;
      }
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            setIsFaceDetected(true);
            const landmarks = results.faceLandmarks[0];
            ctx.fillStyle = "rgba(59, 130, 246, 0.45)";
            for (const pt of landmarks) {
              ctx.beginPath();
              ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1.2, 0, 2 * Math.PI);
              ctx.fill();
            }
            const drawEye = (indices: number[], color: string) => {
              ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath();
              indices.forEach((idx, i) => {
                const p = landmarks[idx];
                if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
                else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
              });
              ctx.closePath(); ctx.stroke();
            };
            const leftEar = calculateEAR(landmarks, LEFT_EYE);
            const rightEar = calculateEAR(landmarks, RIGHT_EYE);
            const avgEar = (leftEar + rightEar) / 2.0;
            const mar = calculateMAR(landmarks);
            const eyeColor = avgEar < earThreshold ? "rgba(239,68,68,0.8)" : "rgba(16,185,129,0.8)";
            drawEye(LEFT_EYE, eyeColor); drawEye(RIGHT_EYE, eyeColor);
            setCurrentEar(Number(avgEar.toFixed(3)));
            setCurrentMar(Number(mar.toFixed(3)));
            if (avgEar < earThreshold) {
              closedFramesRef.current++;
              if (closedFramesRef.current === 5) incrementBlink();
              if (closedFramesRef.current > 45) {
                if (status !== 'Emergency') {
                  setStatus('Drowsy');
                  const t = performance.now();
                  if (t - lastAlarmTimeRef.current > 2000) {
                    addWarning(); playAlarm();
                    speak("Wake up! You are feeling drowsy.");
                    lastAlarmTimeRef.current = t;
                    if (drowsyWarnings >= 3) {
                      setStatus('Emergency'); addEmergency();
                      speak("Emergency mode activated. Please pull over safely.");
                    }
                  }
                }
              } else if (closedFramesRef.current > 15 && status !== 'Emergency') {
                setStatus('Warning');
              }
            } else {
              closedFramesRef.current = Math.max(0, closedFramesRef.current - 2);
              if (closedFramesRef.current === 0 && status !== 'Emergency') setStatus('Awake');
            }
          } else { setIsFaceDetected(false); }
        }
      }
    }
    if (isTracking) requestRef.current = requestAnimationFrame(detect);
  }, [isTracking, status, earThreshold, playAlarm, speak, addWarning, addEmergency, incrementBlink, drowsyWarnings, setStatus]);

  useEffect(() => {
    if (isTracking) {
      if (!trackingStartTime) setTrackingStartTime(Date.now());
      requestRef.current = requestAnimationFrame(detect);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setTrackingStartTime(null);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isTracking, detect, trackingStartTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSession = async () => {
    const durationSeconds = trackingStartTime 
      ? Math.floor((Date.now() - trackingStartTime) / 1000) 
      : 0;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: durationSeconds,
          blinkCount,
          drowsyWarnings,
          emergencyStops
        })
      });
      if (res.ok) showToast("✅ Session saved successfully!");
    } catch {
      showToast("⚠️ Backend not reachable. Ensure the server is running.");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessionHistory(data.data || []);
        setShowHistory(true);
      }
    } catch {
      showToast("⚠️ Could not fetch history. Ensure the server is running.");
    }
  };

  const statusMap: Record<string, { label: string; color: string; dot: string; cls: string }> = {
    Awake:     { label: 'AWAKE',     color: 'text-emerald-400', dot: 'bg-emerald-400', cls: 'status-awake' },
    Warning:   { label: 'WARNING',   color: 'text-amber-400',   dot: 'bg-amber-400',   cls: 'status-warning' },
    Drowsy:    { label: 'DROWSY',    color: 'text-red-400',     dot: 'bg-red-400',     cls: 'status-drowsy' },
    Emergency: { label: 'EMERGENCY', color: 'text-red-500',     dot: 'bg-red-500',     cls: 'status-emergency' },
  };
  const sc = statusMap[status];


  return (
    <div className="h-screen flex flex-col md:flex-row" style={{ background: '#050810' }}>
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-[380px] flex-shrink-0 flex flex-col h-screen overflow-y-auto border-r border-white/5"
        style={{ background: 'rgba(8, 12, 24, 0.95)', padding: '28px' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}
          style={{ marginBottom: '32px' }}>
          <img src="/logo.png" alt="" className="w-10 h-10 rounded-md" />
          <span className="text-xl font-bold tracking-tight text-white">
            Drowse<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Guard</span>
          </span>
        </div>

        {/* Status */}
        <div className={`rounded-xl border ${sc.cls}`}
          style={{ padding: '24px', marginBottom: '32px' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-3 h-3 rounded-full ${sc.dot} ${status !== 'Awake' ? 'animate-pulse' : ''}`} />
            <span className={`text-sm font-semibold uppercase tracking-widest ${sc.color}`}>Status</span>
          </div>
          <div className={`text-3xl font-black tracking-wide ${sc.color}`}>{sc.label}</div>
          {isTracking && !isFaceDetected && <p className="text-sm text-slate-500 mt-2">Searching for face...</p>}
          {!isTracking && <p className="text-sm text-slate-500 mt-2">Tracking paused</p>}
        </div>

        {/* Stats Grid */}
        <div className="flex-grow grid grid-cols-2 gap-3 content-start">
          <div className="stat-card flex flex-col justify-center items-center text-center" style={{ padding: '16px' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Blinks</span>
            <span className="font-mono text-2xl font-black text-cyan-400 bg-cyan-400/10 px-3 py-0.5 rounded-full">{blinkCount}</span>
          </div>
          <div className="stat-card flex flex-col justify-center items-center text-center" style={{ padding: '16px' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Warnings</span>
            <span className={`font-mono text-2xl font-black px-3 py-0.5 rounded-full ${drowsyWarnings > 0 ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 bg-white/5'}`}>{drowsyWarnings}</span>
          </div>
          <div className="stat-card flex flex-col justify-center items-center text-center" style={{ padding: '16px' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">EAR</span>
            <span className={`font-mono text-lg font-bold ${currentEar < earThreshold ? 'text-red-400' : 'text-blue-400'}`}>{currentEar.toFixed(2)}</span>
          </div>
          <div className="stat-card flex flex-col justify-center items-center text-center" style={{ padding: '16px' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">MAR</span>
            <span className="font-mono text-lg font-bold text-violet-400">{currentMar.toFixed(2)}</span>
          </div>
          {/* FPS takes full width to look balanced */}
          <div className="col-span-2 stat-card flex justify-between items-center" style={{ padding: '12px 16px' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">FPS</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{fps}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={handleSaveSession} className="btn-ghost py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              💾 Save
            </button>
            <button onClick={fetchHistory} className="btn-ghost py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              📊 History
            </button>
          </div>
          <button onClick={() => setShowSettings(true)} className="btn-ghost w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            ⚙️ Settings
          </button>
          <button onClick={() => setTracking(!isTracking)}
            className={`w-full py-4 mt-2 rounded-xl text-lg font-bold flex justify-center items-center gap-2 transition-transform active:scale-95 ${isTracking ? 'btn-danger shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'btn-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
            {isTracking ? '■ Stop Tracking' : '▶ Start Tracking'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#09090B]" style={{ padding: '24px 32px' }}>
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Live Feed</h1>
            <p className="text-base text-slate-400 mt-1">
              {modelLoaded ? 'MediaPipe Face Mesh — 478 landmarks' : 'Loading AI model...'}
            </p>
          </div>
        </div>

        {/* Camera */}
        <div className="camera-container flex-1 relative flex justify-center items-center rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
          
          {/* Internal Face Locked Badge */}
          <div className="absolute top-4 right-4 z-40 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl flex items-center gap-3 shadow-xl" style={{ padding: '10px 16px' }}>
            <span className={`w-2.5 h-2.5 rounded-full ${isFaceDetected && isTracking ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
            <span className="text-xs text-white font-bold tracking-wide uppercase">{isFaceDetected ? 'Face Locked' : 'No Face Detected'}</span>
          </div>
          {!isTracking && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ background: 'rgba(5,8,16,0.85)' }}>
              <div className="text-6xl mb-4">📷</div>
              <p className="text-xl text-slate-300 font-medium">Camera paused</p>
              <p className="text-base text-slate-500 mt-2">Click "Start Tracking" to begin</p>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30" style={{ background: 'rgba(5,8,16,0.92)' }}>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-xl text-red-400 font-semibold mb-2">Camera Unavailable</p>
              <p className="text-base text-slate-400 text-center max-w-sm">{cameraError}</p>
              <button onClick={() => window.location.reload()}
                className="btn-ghost mt-6 py-3 px-6 rounded-xl text-base font-medium">🔄 Retry</button>
            </div>
          )}
          
          {!cameraError && (
            <Webcam 
              key={selectedCameraId || 'default'}
              ref={webcamRef} 
              audio={false} 
              mirrored={true}
              className="absolute inset-0 w-full h-full object-cover"
              videoConstraints={{ 
                width: 1280, 
                height: 720, 
                ...(selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: "user" })
              }}
              onUserMedia={refreshCameras}
              onUserMediaError={(err) => setCameraError(`Camera failed: ${typeof err === 'string' ? err : (err as any)?.message || 'Unknown error'}`)}
            />
          )}
          <canvas ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
            style={{ transform: 'scaleX(-1)' }} width={1280} height={720} />
          {status === 'Emergency' && (
            <div className="absolute inset-0 z-30 emergency-overlay flex flex-col justify-center items-center">
              <div className="text-7xl mb-6">⚠️</div>
              <h1 className="text-5xl font-black text-white tracking-widest mb-4">EMERGENCY STOP</h1>
              <p className="text-xl text-red-200 mb-8">Pull over safely now.</p>
              <button onClick={() => setStatus('Awake')}
                className="bg-white text-red-900 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-100">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 modal-backdrop flex justify-center items-center p-4">
          <div className="modal-content w-full max-w-md" style={{ padding: '24px' }}>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <span className="text-blue-400">⚙️</span> Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Camera selector */}
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <span className="text-slate-300 font-medium text-base">Camera Device</span>
                  <span className="font-mono text-cyan-400 text-xs bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                    {cameras.length} found
                  </span>
                </div>
                <select
                  value={selectedCameraId}
                  onChange={(e) => { setSelectedCameraId(e.target.value); setCameraError(''); }}
                  className="camera-select w-full"
                  disabled={cameras.length === 0}
                  style={{ width: '100%' }}
                >
                  {cameras.length === 0 && <option value="">No cameras detected</option>}
                  {cameras.map((cam, i) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* EAR Threshold */}
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <span className="text-slate-300 font-medium text-base">EAR Threshold</span>
                  <span className="font-mono text-blue-400 font-bold bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                    {earThreshold}
                  </span>
                </div>
                <input type="range" min="0.1" max="0.4" step="0.01" value={earThreshold}
                  onChange={(e) => useStore.getState().setEarThreshold(parseFloat(e.target.value))} 
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-base">Alarm Sound</span>
                  <div className={`toggle-switch ${alarmSoundEnabled ? 'active' : ''}`}
                    onClick={() => useStore.getState().toggleAlarmSound()} />
                </div>
                
                <div style={{ height: '1px', width: '100%', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-base">Voice Alerts</span>
                  <div className={`toggle-switch ${voiceAlertEnabled ? 'active' : ''}`}
                    onClick={() => useStore.getState().toggleVoiceAlert()} />
                </div>
              </div>

              <button onClick={playAlarm} className="btn-ghost w-full py-3 rounded-xl text-base font-bold" style={{ marginTop: '4px', background: 'rgba(255, 255, 255, 0.03)' }}>
                🔔 Test Alarm
              </button>
            </div>

            <button onClick={() => setShowSettings(false)} className="btn-primary w-full py-3.5 text-lg font-bold shadow-lg shadow-blue-500/25" style={{ marginTop: '24px' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── History Modal ── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 modal-backdrop flex justify-center items-center p-4">
          <div className="modal-content w-full max-w-2xl flex flex-col" style={{ padding: '24px', maxHeight: '85vh' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">📊</span> Session History
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessionHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-lg">No sessions saved yet. Start tracking and save a session!</div>
              ) : (
                sessionHistory.map(session => (
                  <div key={session.id} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-white font-bold text-lg">
                        {new Date(session.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      <div className="text-slate-400 text-sm mt-1 font-medium">Duration: {(session.duration / 60).toFixed(1)} mins</div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5 flex-1 md:flex-none text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Blinks</div>
                        <div className="font-mono text-cyan-400 font-bold text-lg">{session.blinkCount}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5 flex-1 md:flex-none text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Warnings</div>
                        <div className={`font-mono font-bold text-lg ${session.drowsyWarnings > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{session.drowsyWarnings}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5 flex-1 md:flex-none text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Stops</div>
                        <div className={`font-mono font-bold text-lg ${session.emergencyStops > 0 ? 'text-red-400' : 'text-slate-300'}`}>{session.emergencyStops}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl transition-all duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
