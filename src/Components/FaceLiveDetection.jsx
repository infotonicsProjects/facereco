"use client";
import React, { useCallback } from "react";
import * as faceapi from "face-api.js";
const FaceReconistion = () => {
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);

  const videoRef = React.useRef();
  const videoHeight = 640;
  const videoWidth = 860;
  const canvasRef = React.useRef();
  const canvasRef2 = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      Promise.all([
        faceapi.loadSsdMobilenetv1Model(MODEL_URL),
        faceapi.loadFaceLandmarkModel(MODEL_URL),
        faceapi.loadFaceRecognitionModel(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };
    loadModels();
  }, []);
  const startDetection = async (e) => {
    const input = document.getElementById("inputfile");
    let fullFaceDescriptions = await faceapi
      .detectAllFaces(input)
      .withFaceLandmarks()
      .withFaceDescriptors();
    console.log(input);
    fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions);
    faceapi.draw.drawDetections(canvasRef2.current, fullFaceDescriptions);
  };

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
        alert("error give a permision");
        setCaptureVideo(false);
      });
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = {
          width: videoWidth,
          height: videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvasRef &&
          canvasRef.current &&
          canvasRef.current
            .getContext("2d")
            .clearRect(0, 0, videoWidth, videoHeight);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawFaceExpressions(
            canvasRef.current,
            resizedDetections
          );
      }
    }, 100);
  };

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current?.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  };

  return (
    <>
      <div>
        <div style={{ textAlign: "center", padding: "10px" }}>
          {captureVideo && modelsLoaded ? (
            <button
              onClick={closeWebcam}
              style={{
                cursor: "pointer",
                backgroundColor: "green",
                color: "white",
                padding: "15px",
                fontSize: "25px",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Close Webcam
            </button>
          ) : (
            <button
              onClick={startVideo}
              style={{
                cursor: "pointer",
                backgroundColor: "green",
                color: "white",
                padding: "15px",
                fontSize: "25px",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Open Webcam
            </button>
          )}
        </div>
        {captureVideo ? (
          modelsLoaded ? (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px",
                }}
              >
                <video
                  ref={videoRef}
                  height={videoHeight}
                  width={videoWidth}
                  onPlay={handleVideoOnPlay}
                  style={{ borderRadius: "10px" }}
                />
                <canvas ref={canvasRef} style={{ position: "absolute" }} />
              </div>
            </div>
          ) : (
            <div className="text-white">loading...</div>
          )
        ) : (
          <></>
        )}
      </div>
      <input
        type="file"
        accept="png jpeg jpg gif "
        onChange={startDetection}
        id="inputfile"
      />
      <canvas ref={canvasRef2} style={{ position: "absolute" }} />
    </>
  );
};

export default FaceReconistion;
