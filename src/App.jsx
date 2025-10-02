import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("🤚 ...");

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks) => {
          landmarks.forEach((point) => {
            ctx.beginPath();
            ctx.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              5,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "blue";
            ctx.fill();
          });

          const g = detectGesture(landmarks);
          setGesture(g);
        });
      } else {
        setGesture("🤚 ...");
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  function detectGesture(landmarks) {
    const isFingerOpen = (tip, pip) => landmarks[tip].y < landmarks[pip].y;

    const thumbOpen = landmarks[4].x < landmarks[3].x; 
    const indexOpen = isFingerOpen(8, 6);
    const middleOpen = isFingerOpen(12, 10);
    const ringOpen = isFingerOpen(16, 14);
    const pinkyOpen = isFingerOpen(20, 18);

    if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen && !thumbOpen)
      return "✊ ...";

    if (indexOpen && middleOpen && ringOpen && pinkyOpen)
      return "🖐 ...";

    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen)
      return "👍 ...";

    if (thumbOpen && indexOpen && !middleOpen && !ringOpen && pinkyOpen)
      return "🤟 ...";

    if (!indexOpen && middleOpen && !ringOpen && !pinkyOpen)
      return "🖕 ...";

    return "❓ ...";
  }

  

  return (
    <div className="flex gap-[50px] items-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl text-cyan-400 font-bold mb-[20px]">Detection by BKDR</h1>
        <video ref={videoRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} className="border-1 border-cyan-400" width="640" height="480" />
        <p className="text-lg mt-3 text-yellow-300">{gesture}</p>
      </div>
    <div>
      {gesture === "✊ ..." && (
        <div className="bg-blue-500 rounded-[50%] w-[200px] h-[200px] mt-4"></div>
      )}
      {gesture === "🖐 ..." && (
        <div className="bg-green-500 w-[200px] h-[200px] mt-4"></div>
      )}
      {gesture === "👍 ..." && (
        <div className="bg-yellow-500 w-[200px] h-[200px] rotate-45 mt-4"></div>
      )}
      {gesture === "🤟 ..." && (
        <>
          {
            setTimeout(() => {
              window.open("https://www.youtube.com/", "_blank")
            }, 1000)
          }
          <div className="bg-red-500 w-[400px] h-[400px] rounded-full"></div>
        </>
      )}
      {gesture === "🖕 ..." && (
        <div>
          <img src="https://i.pinimg.com/564x/54/10/52/54105228d7d44538f8a566ff1360359e.jpg" alt="" />
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
