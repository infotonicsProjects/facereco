"use client";
import {
  FaceMatcher,
  LabeledFaceDescriptors,
  detectAllFaces,
  detectSingleFace,
  draw,
  loadFaceLandmarkModel,
  loadFaceRecognitionModel,
  loadSsdMobilenetv1Model,
  matchDimensions,
  resizeResults,
} from "face-api.js";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const MODEL_URL = "/models";
const FACE_MATCHER_THRESHOLD = 0.6;
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function FaceRecognition() {
  const [dataSetImages, setDataSetImages] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaderMsg, setLoaderMsg] = useState("");
  const [queryImage, setQueryImage] = useState(null);
  const [recognitionError, setRecognitionError] = useState("");

  const queryCanvasElement = useRef(null);
  const queryImageElement = useRef(null);
  const refImgElements = useRef([]);

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

    setFaceMatcher(faceMatcher);
    setIsLoading(false);
  }, [dataSetImages]);

  const loadRecognizedFaces = async () => {
    if (dataSetImages.length === 0) {
      setRecognitionError("No data set found for recognition.");
    } else if (!queryImageElement.current) {
      setRecognitionError("Please upload query image for recognition.");
    }
    if (
      queryCanvasElement.current &&
      queryImageElement.current &&
      faceMatcher
    ) {
      setRecognitionError("");
      const resultsQuery = await detectAllFaces(queryImageElement.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      await matchDimensions(
        queryCanvasElement.current,
        queryImageElement.current
      );

      const results = await resizeResults(resultsQuery, {
        width: queryImageElement.current.width,
        height: queryImageElement.current.height,
      });

      const queryDrawBoxes = results.map((res) => {
        const bestMatch = faceMatcher.findBestMatch(res.descriptor);
        return new draw.DrawBox(res.detection.box, {
          label: bestMatch.toString(),
        });
      });

      queryDrawBoxes.forEach((drawBox) =>
        drawBox.draw(queryCanvasElement.current)
      );
    }
    setIsLoading(false);
  };

  const setImagesForRecognition = (event) => {
    const files = Array.from(event.target.files || []);

    // Limit the number of selected images
    if (files.length > 20) {
      setRecognitionError("You can select a maximum of 20 images.");
      return;
    }

    if (files) {
      const images = [];
      refImgElements.current = [];
      setRecognitionError("");
      for (let index = 0; index < event.target.files.length; index++) {
        const image = event.target.files[index];
        if (VALID_IMAGE_TYPES.includes(image.type)) {
          images.push({
            name: image.name,
            src: URL.createObjectURL(image),
          });
        }
      }
      setDataSetImages(images);
    }
  };

  const handleQueryImage = (event) => {
    if (event?.target?.files && event?.target?.files[0]) {
      setRecognitionError("");
      const image = event.target.files[0];
      setQueryImage(URL.createObjectURL(image));
      if (queryCanvasElement.current) {
        const canvasEle = queryCanvasElement.current.getContext("2d");
        canvasEle?.reset();
      }
    }
  };

  const loadModels = async () => {
    setLoaderMsg("Please wait while SSD Mobile net model is loading...");
    await loadSsdMobilenetv1Model(MODEL_URL);
    setLoaderMsg("Please wait while face landmark model is loading...");
    await loadFaceLandmarkModel(MODEL_URL);
    setLoaderMsg("Please wait while face expression model is loading...");
    await loadFaceRecognitionModel(MODEL_URL);
    setIsLoading(false);
  };

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (dataSetImages?.length > 0) {
      processImagesForRecognition();
    }
  }, [dataSetImages, processImagesForRecognition]);

  return (
    <>
      <div className={`container ${"container"}`}>
        <div className={`${imageSection} ${multiImageSection}`}>
          <div className={"twoSectionPreview"}>
            <div className={"dataSetSection"}>
              <h4>Create a data set for recognition</h4>
              <div>
                {dataSetImages?.map((image, index) => {
                  return (
                    <div className={"imageArea"} key={`data-set-${index}`}>
                      <Image
                        ref={(imageRef) => addImageRef(index, imageRef)}
                        src={image.src}
                        alt={image.name}
                        width={100}
                        height={100}
                      />
                      <span>{image.name}</span>
                    </div>
                  );
                })}
              </div>
              <label htmlFor="multiFileSelect" className={"fileUpload"}>
                <span>
                  <i className="bi bi-upload"></i>
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
            </div>
            <div className={"queryImageSection"}>
              <h4>Query Image</h4>
              <div>
                {queryImage && (
                  <>
                    <Image
                      ref={queryImageElement}
                      src={queryImage}
                      alt="Image to be recognized for face, Face Recognition"
                      width={500}
                      height={500}
                    />
                    <canvas
                      ref={queryCanvasElement}
                      className={"canvas"}
                      width={500}
                      height={500}
                    />
                  </>
                )}
              </div>
              <label htmlFor="queryImage" className={"fileUpload"}>
                <span>
                  <i className="bi bi-upload"></i>
                </span>
                Upload query image for face recognition
              </label>
              <input
                id="queryImage"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleQueryImage}
                hidden
              />
            </div>
          </div>
          <div className={"buttonContainer"}>
            <button variant="primary" onClick={() => loadRecognizedFaces()}>
              Recognize Face
            </button>
          </div>
          {recognitionError && (
            <div className="alert alert-danger" role="alert">
              {recognitionError}
            </div>
          )}
          <div>
            <b>Note</b>: Please follow below rules for data set in order to
            image recognition work
            <ol>
              <li>Image should be of single person only.</li>
              <li>
                Name of the file/image is considered to recognize the person
                from query image.
              </li>
              <li>
                For example, image is uploaded with file name neeraj.jpg, neeraj
                (1).jpg, vageele.jpg, etc. the label will show neeraj if face is
                matched from data ser in query image.
              </li>
              <li>All data will be lost on page refresh.</li>
            </ol>
            <b>Privacy Notice:</b>
            <ul>
              <li>
                Uploaded Image are not saved or collected any where for any
                purpose. Above program is just for demonstration purpose only.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
