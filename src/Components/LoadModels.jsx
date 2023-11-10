"use client";
import {
  loadFaceLandmarkModel,
  loadFaceRecognitionModel,
  loadSsdMobilenetv1Model,
} from "face-api.js";
import { useEffect } from "react";
import { MODEL_URL } from "./contants";
import { useDispatch } from "react-redux";
import { setLoadingRedux } from "@/store/slicer";

const Detection = ({ children }) => {
  const dispath = useDispatch();
  dispath(setLoadingRedux(true));
  useEffect(() => {
    const loadModels = async () => {
      await loadSsdMobilenetv1Model(MODEL_URL);
      await loadFaceLandmarkModel(MODEL_URL);
      await loadFaceRecognitionModel(MODEL_URL);
      await dispath(setLoadingRedux(false));
    };
    loadModels();
  }, []);
  return children;
};

export default Detection;
