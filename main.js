let stepCount = 0;
let isTracking = false;
const accelerationThreshold = 12;
let lastAcceleration = 0;
let stepsData = [];

const counterElement = document.getElementById('counter');
const stepDataElement = document.getElementById('stepData');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

async function requestMotionPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    const permission = await DeviceMotionEvent.requestPermission();
    return permission === 'granted';
  }
  return true; // Assume granted for non-iOS devices
}

// Start tracking steps
async function startTracking() {
  const permissionGranted = await requestMotionPermission();
  if (!permissionGranted) {
    alert('Motion permission denied!');
    return;
  }

  stepCount = 0;
  stepsData = [];
  isTracking = true;
  counterElement.style.display = 'block';
  counterElement.innerText = stepCount;
  stepDataElement.innerText = 'Tracking steps...';

  startBtn.disabled = true;
  stopBtn.disabled = false;
  downloadBtn.disabled = true;

  window.addEventListener('devicemotion', detectStep);
}

// Stop tracking steps
function stopTracking() {
  isTracking = false;
  stepDataElement.innerText = `Tracking stopped. Total steps: ${stepCount}`;

  startBtn.disabled = false;
  stopBtn.disabled = true;
  downloadBtn.disabled = stepCount === 0;

  window.removeEventListener('devicemotion', detectStep);
}

// Step detection logic
function detectStep(event) {
  if (!isTracking) return;

  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const netAcceleration = Math.sqrt(
    acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
  );

  if (netAcceleration - lastAcceleration > accelerationThreshold) {
    stepCount++;
    counterElement.innerText = stepCount;
    stepsData.push({ timestamp: Date.now(), steps: stepCount });
  }

  lastAcceleration = netAcceleration;
}

// Download step data
function downloadData() {
  const blob = new Blob([JSON.stringify(stepsData, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'step_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Event listeners
startBtn.addEventListener('click', startTracking);
stopBtn.addEventListener('click', stopTracking);
downloadBtn.addEventListener('click', downloadData);
