import cv2
import numpy as np
import time
import os
import platform

print("=" * 60)
print("DRIVER DROWSINESS DETECTION & EMERGENCY STOP SYSTEM")
print("=" * 60)

# Initialize camera
cap = cv2.VideoCapture(0)
cap.set(3, 640)  # Width
cap.set(4, 480)  # Height

# Load detectors
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# Parameters
closed_frames = 0
ALARM_SECONDS = 5  # 5 seconds of closed eyes
FRAMES_PER_SECOND = 30  # Assuming 30 FPS
ALARM_FRAMES = ALARM_SECONDS * FRAMES_PER_SECOND

alarm_count = 0
MAX_ALARMS = 3
emergency_mode = False
emergency_stop_complete = False
alarm_playing = False

# Timers
eye_closed_start_time = None
emergency_start_time = None
last_alarm_time = 0

print("\nSYSTEM STATUS:")
print(f"• Alarm triggers after: {ALARM_SECONDS} seconds of closed eyes")
print(f"• Maximum alarms before emergency: {MAX_ALARMS}")
print(f"• Emergency procedure: Simulate outside camera view and safe stop")
print("\nCONTROLS:")
print("  'q' - Quit")
print("  'r' - Reset system")
print("  't' - Test alarm (trigger manually)")
print("-" * 60)

def play_alarm_sound():
    """Play alarm sound (works on most systems)"""
    try:
        # Different methods for different OS
        system_platform = platform.system()
        if system_platform == "Windows":
            import winsound
            winsound.Beep(1000, 500)  # Frequency 1000Hz, duration 500ms
            winsound.Beep(800, 500)
            winsound.Beep(1000, 500)
        elif system_platform == "Darwin":  # macOS
            os.system('afplay /System/Library/Sounds/Funk.aiff')
        else:  # Linux
            os.system('play -n synth 0.5 sin 1000')
            os.system('play -n synth 0.5 sin 800')
            os.system('play -n synth 0.5 sin 1000')
    except:
        # Fallback to terminal bell
        print('\a\a\a')  # Terminal bell

def draw_car_dashboard(frame, speed=60):
    """Draw a car dashboard on the frame"""
    # Dashboard background
    cv2.rectangle(frame, (0, 400), (640, 480), (30, 30, 30), -1)
    cv2.rectangle(frame, (0, 400), (640, 480), (60, 60, 60), 2)
    
    # Speedometer
    cv2.putText(frame, "SPEED", (30, 425), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(frame, f"{speed} km/h", (30, 455), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    
    # Fuel
    cv2.putText(frame, "FUEL", (180, 425), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(frame, "75%", (180, 455), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
    
    # Engine temp
    cv2.putText(frame, "ENGINE", (330, 425), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(frame, "90C", (330, 455), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 255), 2)
    
    # Alarms indicator
    alarm_color = (255, 0, 0) if alarm_count > 0 else (100, 100, 100)
    cv2.putText(frame, "ALARMS", (480, 425), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(frame, f"{alarm_count}/{MAX_ALARMS}", (480, 455), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, alarm_color, 2)

def draw_emergency_procedure(frame, current_speed, step):
    """Draw emergency stop procedure visualization"""
    # Emergency procedure panel
    cv2.rectangle(frame, (20, 20), (620, 220), (20, 20, 40), -1)
    cv2.rectangle(frame, (20, 20), (620, 220), (0, 0, 200), 2)
    
    # Title
    cv2.putText(frame, "EMERGENCY STOP", (40, 50), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    # Steps
    steps = [
        "1. Hazard lights ON",
        "2. Reducing speed",
        "3. Scanning for safe area",
        "4. Moving to shoulder",
        "5. Complete stop",
        "6. Vehicle STOPPED"
    ]
    
    # Draw steps in 2 columns
    for i, step_text in enumerate(steps):
        x_pos = 40 if i < 3 else 320
        y_pos = 80 + ((i % 3) * 30)
        color = (0, 255, 0) if i < step else (150, 150, 150)
        cv2.putText(frame, step_text, (x_pos, y_pos), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
    
    # Speed indicator
    speed_color = (255, 0, 0) if current_speed > 0 else (0, 255, 0)
    cv2.putText(frame, f"Speed: {current_speed} km/h", (40, 170), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, speed_color, 1)
    
    # Progress bar
    progress = min(step / 6.0, 1.0)
    bar_width = int(400 * progress)
    cv2.rectangle(frame, (40, 185), (40 + bar_width, 195), (0, int(255*progress), 0), -1)
    cv2.rectangle(frame, (40, 185), (440, 195), (100, 100, 100), 1)
    cv2.putText(frame, f"Progress: {int(progress*100)}%", (40, 210), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

# Define text regions to prevent overlap
text_regions = {
    "status_bar": (0, 0, 640, 50),
    "face_region": (0, 50, 640, 300),
    "dashboard": (0, 400, 640, 480),
    "alarm_indicator": (500, 10, 140, 40)
}

# Main loop
frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        print("Camera error!")
        break
    
    # Mirror effect
    frame = cv2.flip(frame, 1)
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    if not emergency_mode:
        # NORMAL MODE: Monitor driver
        # Detect faces with better parameters
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(120, 120))
        
        eyes_detected = 0
        face_detected = len(faces) > 0
        
        for (x, y, w, h) in faces:
            # Make sure face rectangle is visible
            x, y = max(10, x), max(60, y)  # Keep face away from edges
            
            # Draw face rectangle
            color = (0, 255, 0)  # Green
            if closed_frames > ALARM_FRAMES * 0.5:
                color = (0, 255, 255)  # Yellow
            if closed_frames >= ALARM_FRAMES:
                color = (0, 0, 255)  # Red
            
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            
            # Region for eyes (increased area for better detection)
            roi_gray = gray[y:y+int(h*0.7), x:x+w]
            roi_color = frame[y:y+int(h*0.7), x:x+w]
            
            # Detect eyes with improved parameters
            eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 5, minSize=(25, 25))
            eyes_detected = len(eyes)
            
            if eyes_detected >= 2:
                # Eyes detected - reset timer
                closed_frames = 0
                eye_closed_start_time = None
                alarm_playing = False
                
                # Draw eye boxes
                for (ex, ey, ew, eh) in eyes[:2]:
                    cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (255, 0, 0), 1)
            else:
                # No eyes detected
                closed_frames += 1
                
                if eye_closed_start_time is None:
                    eye_closed_start_time = time.time()
                
                # Calculate time eyes have been closed
                if eye_closed_start_time:
                    eyes_closed_time = time.time() - eye_closed_start_time
                    
                    # Position text above face, but within frame
                    text_y = max(10, y - 20)
                    text_x = max(10, x)
                    cv2.putText(frame, f"Eyes closed: {eyes_closed_time:.1f}s", 
                               (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        
        # Calculate time until alarm
        time_until_alarm = max(0, ALARM_SECONDS - (closed_frames / FRAMES_PER_SECOND))
        
        # Check for alarm condition (5 seconds)
        if closed_frames >= ALARM_FRAMES:
            current_time = time.time()
            if alarm_count < MAX_ALARMS and current_time - last_alarm_time > 2:  # Prevent rapid alarms
                alarm_count += 1
                last_alarm_time = current_time
                print(f"\n{'='*40}")
                print(f"ALARM {alarm_count}/{MAX_ALARMS} TRIGGERED!")
                print(f"Eyes closed for {ALARM_SECONDS} seconds")
                print("Playing alarm sound...")
                
                # Play alarm sound
                play_alarm_sound()
                
                print(f"{'='*40}")
                
                # Reset for next measurement
                closed_frames = 0
                eye_closed_start_time = None
            
            # Check for emergency mode
            if alarm_count >= MAX_ALARMS and not emergency_mode:
                emergency_mode = True
                emergency_start_time = time.time()
                print(f"\n{'='*40}")
                print("EMERGENCY MODE ACTIVATED!")
                print("Too many drowsiness alarms detected")
                print("Switching to external camera view...")
                print("Initiating safe stop procedure...")
                print(f"{'='*40}")
        
        # Draw status overlay with non-overlapping text
        cv2.rectangle(frame, (0, 0), (640, 50), (40, 40, 40), -1)
        
        # Status indicator
        if closed_frames > ALARM_FRAMES * 0.7:
            status = "DROWSY WARNING"
            color = (0, 255, 255)
        elif closed_frames > ALARM_FRAMES * 0.3:
            status = "STAY ALERT"
            color = (0, 165, 255)
        else:
            status = "AWAKE"
            color = (0, 255, 0)
        
        # Status text (left side)
        cv2.putText(frame, f"Status: {status}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Eye status (center)
        eye_status = "EYES OPEN" if eyes_detected >= 2 else "EYES CLOSED"
        eye_color = (0, 255, 0) if eyes_detected >= 2 else (0, 0, 255)
        cv2.putText(frame, eye_status, (220, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, eye_color, 1)
        
        # Timer (right side)
        timer_color = (0, 255, 0) if time_until_alarm > 2 else (0, 255, 255) if time_until_alarm > 0.5 else (0, 0, 255)
        cv2.putText(frame, f"Alarm: {time_until_alarm:.1f}s", (450, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, timer_color, 1)
        
        # Draw car dashboard
        draw_car_dashboard(frame, 60)
        
        # Instructions (above dashboard, within bounds)
        cv2.putText(frame, "Close eyes for 5s to trigger alarm", (10, 390), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        # Face detection status
        if not face_detected:
            cv2.putText(frame, "NO FACE DETECTED", (200, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.putText(frame, "Please position face in center", (150, 270), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
    else:
        # EMERGENCY MODE: Simulate external view and safe stop
        # Convert to "night mode" for external view
        frame = cv2.convertScaleAbs(frame, alpha=0.5, beta=0)
        
        # Add "external camera" overlay
        cv2.putText(frame, "EXTERNAL CAMERA VIEW", (180, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Add road lines (simulated)
        cv2.line(frame, (0, 240), (640, 240), (255, 255, 255), 2)
        cv2.line(frame, (0, 250), (640, 250), (255, 255, 255), 1)
        cv2.line(frame, (0, 230), (640, 230), (255, 255, 255), 1)
        
        # Add simulated other vehicles
        cv2.rectangle(frame, (100, 200), (200, 220), (255, 0, 0), -1)  # Red car left
        cv2.rectangle(frame, (440, 200), (540, 220), (0, 0, 255), -1)  # Blue car right
        
        # Calculate emergency procedure progress
        if emergency_start_time:
            elapsed = time.time() - emergency_start_time
            step = min(int(elapsed / 2.5), 6)  # 6 steps, 2.5 seconds each
            
            # Calculate decreasing speed
            initial_speed = 60
            current_speed = max(0, initial_speed - (elapsed * 4))
            
            # Draw emergency procedure
            draw_emergency_procedure(frame, int(current_speed), step)
            
            # Check if stop is complete
            if step >= 6 and not emergency_stop_complete:
                emergency_stop_complete = True
                print(f"\n{'='*40}")
                print("EMERGENCY STOP COMPLETE!")
                print("Vehicle safely stopped")
                print("Hazard lights activated")
                print("Emergency services notified")
                print(f"{'='*40}")
        
        # Emergency warning
        cv2.putText(frame, "EMERGENCY MODE ACTIVE", (180, 350), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    
    # Common controls (bottom right, above dashboard)
    cv2.putText(frame, "q:Quit  r:Reset  t:Test", (420, 390), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
    
    # Display frame
    cv2.imshow('Drowsiness Detection System', frame)
    
    # Handle keyboard input
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('r'):
        # Reset system
        closed_frames = 0
        alarm_count = 0
        emergency_mode = False
        emergency_stop_complete = False
        eye_closed_start_time = None
        alarm_playing = False
        print("\n🔄 SYSTEM RESET")
        print("-" * 40)
    elif key == ord('t'):
        # Test alarm manually
        if not emergency_mode:
            alarm_count += 1
            print(f"\nTEST ALARM {alarm_count}/{MAX_ALARMS} TRIGGERED")
            play_alarm_sound()
            
            if alarm_count >= MAX_ALARMS:
                emergency_mode = True
                emergency_start_time = time.time()
                print("EMERGENCY MODE ACTIVATED (TEST)")
    
    frame_count += 1

# Cleanup
cap.release()
cv2.destroyAllWindows()

print("\n" + "=" * 60)
print("FINAL REPORT:")
print(f"• Total alarms triggered: {alarm_count}")
print(f"• Emergency mode: {'ACTIVATED' if emergency_mode else 'NOT ACTIVATED'}")
if emergency_mode:
    print(f"• Vehicle status: {'SAFELY STOPPED' if emergency_stop_complete else 'STOPPING IN PROGRESS'}")
print("=" * 60)