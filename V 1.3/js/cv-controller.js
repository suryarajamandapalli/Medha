import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/+esm";

let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;
let results = undefined;
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

// Gesture State
let currentGesture = "None"; // "1", "2", "3", "4", "Thumb_Up", "None"
let gestureCallback = null;

export async function initCV(callback) {
    gestureCallback = callback;
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
        console.log("HandLandmarker loaded");
    } catch (e) {
        console.error("Error loading HandLandmarker:", e);
    }
}

export async function startCamera() {
    if (!handLandmarker) {
        console.warn("HandLandmarker not loaded yet.");
        return;
    }

    if (webcamRunning) return;
    webcamRunning = true;

    const constraints = { video: true };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    } catch (e) {
        console.error("Error accessing webcam:", e);
        alert("Camera permission denied. Please allow camera access to play.");
    }
}

export function stopCamera() {
    webcamRunning = false;
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

async function predictWebcam() {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    if (webcamRunning) {
        let startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            results = handLandmarker.detectForVideo(video, startTimeMs);
        }

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawConnectors(canvasCtx, landmarks, HandLandmarker.HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 3
                });
                drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });

                // Detect Gesture
                const gesture = detectGesture(landmarks);
                if (gesture !== currentGesture) {
                    currentGesture = gesture;
                    if (gestureCallback) gestureCallback(gesture);
                }
            }
        }
        canvasCtx.restore();

        window.requestAnimationFrame(predictWebcam);
    }
}

// Simple deterministic gesture recognition
function detectGesture(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbIp = landmarks[3];
    const indexPip = landmarks[6];
    const middlePip = landmarks[10];
    const ringPip = landmarks[14];
    const pinkyPip = landmarks[18];

    // Check extended fingers (y < pip.y because y increases downwards)
    const isIndexExtended = indexTip.y < indexPip.y;
    const isMiddleExtended = middleTip.y < middlePip.y;
    const isRingExtended = ringTip.y < ringPip.y;
    const isPinkyExtended = pinkyTip.y < pinkyPip.y;

    // Count extended fingers (excluding thumb)
    let extendedCount = 0;
    if (isIndexExtended) extendedCount++;
    if (isMiddleExtended) extendedCount++;
    if (isRingExtended) extendedCount++;
    if (isPinkyExtended) extendedCount++;

    // Thumb Up Logic: Thumb matches simple check, others curled
    // Thumb tip y < Thumb IP y (pointing up)
    // Thumb tip x is far from index base (extended out)
    const isThumbUp = thumbTip.y < thumbIp.y && extendedCount === 0;

    if (isThumbUp) return "Thumb_Up";
    if (extendedCount === 1) return "1"; // Option 1
    if (extendedCount === 2) return "2"; // Option 2
    if (extendedCount === 3) return "3"; // Option 3
    if (extendedCount === 4) return "4"; // Option 4

    return "None";
}

// Helper: Draw Connectors (Minified version of MediaPipe drawing utils)
function drawConnectors(ctx, landmarks, connections, style) {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    for (const connection of connections) {
        const from = landmarks[connection.start];
        const to = landmarks[connection.end];
        if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x * ctx.canvas.width, from.y * ctx.canvas.height);
            ctx.lineTo(to.x * ctx.canvas.width, to.y * ctx.canvas.height);
            ctx.stroke();
        }
    }
}

function drawLandmarks(ctx, landmarks, style) {
    ctx.fillStyle = style.color;
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, style.lineWidth, 0, 2 * Math.PI);
        ctx.fill();
    }
}
