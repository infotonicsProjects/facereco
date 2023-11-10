"use client";
import dynamic from "next/dynamic";
import {
  FaceMatcher,
  LabeledFaceDescriptors,
  detectSingleFace,
} from "face-api.js";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";
import { addModels } from "@/store/slicer";
import Link from "next/link";
import { toast } from "react-toastify";
import { FACE_MATCHER_THRESHOLD } from "./contants";
const WebcamComponten = dynamic(() => import("./WebcamComponten"));
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CreataFace = () => {
  const [dataSetImages, setDataSetImages] = useState([]);
  const [recognitionError, setRecognitionError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loaderMsg, setLoaderMsg] = useState("");
  const refImgElements = useRef([]);
  const dispatch = useDispatch();
  // add ref for image preview
  const addImageRef = (index, ref) => {
    refImgElements.current[index] = ref;
  };

  const processImagesForRecognition = useCallback(async () => {
    if (!dataSetImages) return;
    setIsLoading(true);
    setLoaderMsg("Please wait while images are being processed...");
    let labeledFaceDescriptors = [];
    labeledFaceDescriptors = await Promise.all(
      refImgElements.current?.map(async (imageEle) => {
        if (imageEle) {
          const label = imageEle?.alt.split(" ")[0];
          const faceDescription = await detectSingleFace(imageEle)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (!faceDescription) {
            console.log(faceDescription);
            alert("take a clear photo");
            throw new Error(`no faces detected for ${label}`);
          }

          const faceDescriptors = [faceDescription.descriptor];
          return new LabeledFaceDescriptors(label, faceDescriptors);
        }
      })
    );

    const faceMatcher = new FaceMatcher(
      labeledFaceDescriptors,
      FACE_MATCHER_THRESHOLD
    );
    dispatch(addModels(faceMatcher));
    toast.success("Face capture");
    localStorage.setItem("faceMatcher", JSON.stringify(faceMatcher));

    setIsLoading(false);
  }, [dataSetImages]);

  const setImagesForRecognition = (event) => {
    const files = Array.from(event.target.files || []);
    // Limit the number of selected images
    if (files.length > 20) {
      setRecognitionError("You can select a maximum of 20 images.");
      return;
    }

    if (files) {
      const images = [];
      const files = [];
      refImgElements.current = [];
      setRecognitionError("");
      for (let index = 0; index < event.target.files.length; index++) {
        const image = event.target.files[index];
        if (VALID_IMAGE_TYPES.includes(image.type)) {
          images.push({
            name: image.name,
            src: URL.createObjectURL(image),
          });
          // image convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            files.push({ name: image.name, src: reader.result });
            if (files.length <= 2) {
              localStorage.setItem("files", JSON.stringify(files));
            }
          };
          reader.readAsDataURL(image);
        }
      }
      setDataSetImages(images);
      localStorage.setItem("dataImages", JSON.stringify(images));
    }
  };
  useEffect(() => {
    if (dataSetImages?.length > 0) {
      processImagesForRecognition();
    }
  }, [dataSetImages, processImagesForRecognition]);
  // for the capture images

  const setImagesForRecognitioncamera = (files) => {
    const name = localStorage.getItem("name");
    if (files) {
      const images = [];
      refImgElements.current = [];
      setRecognitionError("");

      const image = files;

      images.push({
        name: name,
        src: image,
      });

      setDataSetImages(images);
      localStorage.setItem("dataImages", JSON.stringify(images));
    }
  };
  // capture from camera
  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const uri = webcamRef.current.getScreenshot();
    setImagesForRecognitioncamera(uri);
  }, [webcamRef]);
  return (
    <div className="p-7 ">
      <div className="flex items-center justify-center flex-col">
        <Link href="detect" className="text-red-500 underline my-5">
          Click here to Detect
        </Link>
        <div className="flex gap-4 mt-4">
          {dataSetImages?.map((image, index) => (
            <div className={"imageArea mt-5"} key={`data-set-${index}`}>
              <Image
                ref={(imageRef) => addImageRef(index, imageRef)}
                src={image.src}
                alt={image.name}
                width={100}
                height={100}
              />
              <span>{image.name}</span>
            </div>
          ))}
        </div>
        <div
          className="mt-5 flex
          flex-col
          justify-center
          items-center"
        >
          <label
            htmlFor="multiFileSelect"
            className={"fileUpload border p-2 border-yellow-500 mb-5 mt"}
          >
            <span>
              <i className="bi bi-upload "></i>
            </span>
            Upload image data set for face recognition
          </label>
          <input
            id="multiFileSelect"
            type="file"
            onChange={setImagesForRecognition}
            multiple
            accept="image/jpeg, image/png, image/webp"
            hidden
          />
          <WebcamComponten webcamRef={webcamRef} capture={capture} />
        </div>
      </div>
    </div>
  );
};

export default CreataFace;
