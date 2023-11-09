"use client";
import {
  loadFaceLandmarkModel,
  loadFaceRecognitionModel,
  loadSsdMobilenetv1Model,
} from "face-api.js";
import { useEffect } from "react";

const MODEL_URL = "/models";
const Detection = ({ children }) => {
  useEffect(() => {
    const loadModels = async () => {
      await loadSsdMobilenetv1Model(MODEL_URL);
      await loadFaceLandmarkModel(MODEL_URL);
      await loadFaceRecognitionModel(MODEL_URL);
    };
    loadModels();
  }, []);
  return children;
};

export default Detection;
