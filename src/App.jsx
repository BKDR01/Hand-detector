import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("❓ ...");
  const [lastGesture, setLastGesture] = useState(null); 

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

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        ctx.fillStyle = "blue";
        landmarks.forEach((lm) => {
          const x = lm.x * canvas.width;
          const y = lm.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [5, 6], [6, 7], [7, 8],
          [9, 10], [10, 11], [11, 12],
          [13, 14], [14, 15], [15, 16],
          [17, 18], [18, 19], [19, 20],
          [0, 5], [5, 9], [9, 13], [13, 17], [17, 0],
        ];
        connections.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(landmarks[i].x * canvas.width, landmarks[i].y * canvas.height);
          ctx.lineTo(landmarks[j].x * canvas.width, landmarks[j].y * canvas.height);
          ctx.stroke();
        });

        const isFingerUp = (tip, pip) => landmarks[tip].y < landmarks[pip].y;

        const thumbUp = landmarks[4].x < landmarks[3].x;

        const indexUp = isFingerUp(8, 6);
        const middleUp = isFingerUp(12, 10);
        const ringUp = isFingerUp(16, 14);
        const pinkyUp = isFingerUp(20, 18);


        let currentGesture = "❓ ...";

        if (indexUp && middleUp && ringUp && pinkyUp)
          currentGesture = "🖐 ..."; 
        else if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp)
          currentGesture = "✊ ..."; 
        else if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp)
          currentGesture = "👍 ..."; 
        else if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp)
          currentGesture = "🤟 ...";
        else if (!indexUp && middleUp && !ringUp && !pinkyUp)
          currentGesture = "🖕 ..."; 


        setGesture(currentGesture);

        if (currentGesture === "🤟 ..." && lastGesture !== "🤟 ...") {
          window.open("https://www.youtube.com/", "_blank");
          setLastGesture("🤟 ...");
        } else if (currentGesture !== "🤟 ...") {
          setLastGesture(currentGesture);
        }
      }

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, [lastGesture]);

  return (
    <div className="w-full flex flex-wrap justify-center border mx-auto text-center bg-[#242424] h-[100vh] gap-[100px] items-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl text-cyan-400 font-bold mb-[20px]">Detection by BKDR</h1>
        <video ref={videoRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} className="border-1 border-cyan-400 w-full max-w-[640px]" width="640" height="480" />
        <p className="text-lg mt-3 text-yellow-300">{gesture}</p>
      </div>


      <div className="w-[400px]">
        {gesture === "🖐 ..." && (
          <div className="bg-green-500 w-[300px] h-[300px] mt-4"></div>
        )}
        {gesture === "✊ ..." && (
          <div className="bg-blue-500 rounded-[50%] w-[200px] h-[200px] mt-4"></div>
        )}
        {gesture === "👍 ..." && (
          <div className="bg-yellow-500 w-[200px] h-[200px] rotate-45 mt-4"></div>
        )}
        {gesture === "🤟 ..." && (
          <div className="bg-red-500 w-[200px] h-[200px] rounded-full mt-4"></div>
        )}
        {gesture === "🖕 ..." && (
          <img
            src="https://i.pinimg.com/564x/54/10/52/54105228d7d44538f8a566ff1360359e.jpg"
            alt="funny"
            className="w-[400px] mt-4"
          />
        )}
      </div>
    </div>
  );
}

export default App;
