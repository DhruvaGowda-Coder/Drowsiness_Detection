import { create } from 'zustand';

interface State {
  isTracking: boolean;
  earThreshold: number;
  marThreshold: number;
  alarmSoundEnabled: boolean;
  voiceAlertEnabled: boolean;
  blinkCount: number;
  drowsyWarnings: number;
  emergencyStops: number;
  status: 'Awake' | 'Warning' | 'Drowsy' | 'Emergency';
  
  setTracking: (isTracking: boolean) => void;
  setEarThreshold: (val: number) => void;
  setMarThreshold: (val: number) => void;
  toggleAlarmSound: () => void;
  toggleVoiceAlert: () => void;
  incrementBlink: () => void;
  addWarning: () => void;
  addEmergency: () => void;
  setStatus: (status: 'Awake' | 'Warning' | 'Drowsy' | 'Emergency') => void;
  resetSession: () => void;
}

export const useStore = create<State>((set) => ({
  isTracking: false,
  earThreshold: 0.25,
  marThreshold: 0.5,
  alarmSoundEnabled: true,
  voiceAlertEnabled: true,
  blinkCount: 0,
  drowsyWarnings: 0,
  emergencyStops: 0,
  status: 'Awake',

  setTracking: (isTracking) => set({ isTracking }),
  setEarThreshold: (val) => set({ earThreshold: val }),
  setMarThreshold: (val) => set({ marThreshold: val }),
  toggleAlarmSound: () => set((state) => ({ alarmSoundEnabled: !state.alarmSoundEnabled })),
  toggleVoiceAlert: () => set((state) => ({ voiceAlertEnabled: !state.voiceAlertEnabled })),
  incrementBlink: () => set((state) => ({ blinkCount: state.blinkCount + 1 })),
  addWarning: () => set((state) => ({ drowsyWarnings: state.drowsyWarnings + 1 })),
  addEmergency: () => set((state) => ({ emergencyStops: state.emergencyStops + 1 })),
  setStatus: (status) => set({ status }),
  resetSession: () => set({ blinkCount: 0, drowsyWarnings: 0, emergencyStops: 0, status: 'Awake' })
}));
