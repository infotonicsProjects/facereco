"use client";
import {
  loadFaceLandmarkModel,
  loadFaceRecognitionModel,
  loadSsdMobilenetv1Model,
} from "face-api.js";
import { useEffect } from "react";
import { MODEL_URL } from "./contants";

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
