"use client";
import React from "react";
import { toast } from "react-toastify";
import Webcam from "react-webcam";

const WebcamComponten = ({ capture, webcamRef }) => {
  const handleCameraisnotenbel = () => {
    toast.error("camera is not open");
  };
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };
  return (
    <div className="mt-5 flex flex-col items-center justify-center">
      <div className="rounded-full overflow-hidden">
        <Webcam
          audio={false}
          height={800}
          screenshotFormat="image/png"
          width={800}
          ref={webcamRef}
          imageSmoothing={true}
          mirrored={true}
          onUserMediaError={handleCameraisnotenbel}
          screenshotQuality={1}
          videoConstraints={videoConstraints}
          className="yasir"
        />
      </div>
      <button
        onClick={capture}
        className="border mt-5 border-pink-500  w-40 hover:border-yellow-200 hover:scale-105"
      >
        Capture photo
      </button>
    </div>
  );
};

export default WebcamComponten;
