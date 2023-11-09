"use client";
import {
  FaceMatcher,
  LabeledFaceDescriptors,
  detectAllFaces,
  detectSingleFace,
  resizeResults,
} from "face-api.js";
import ImageNext from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addModels } from "@/store/slicer";
import Loader from "@/Components/Loader";
import { FACE_MATCHER_THRESHOLD } from "@/Components/contants";
const QueryDetect = () => {
  const [recognitionError, setRecognitionError] = useState("");
  const images = [
    "/img/yasir.jpeg",
    "/img/yasir2.jpg",
    "/img/yasir1.jpg",
    "/img/yasir.jpg",
    "/img/IMG_20230629_003940.jpeg",
    "/img/friend.jpeg",
    "/img/friend2.jpeg",
    "/img/group.jpeg",
    "/img/group2.jpeg",
    "/img/Lux.jpeg",
    "/img/shallysir.jpeg",
  ];
  const [queryImage, setQueryImage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const queryCanvasElement = useRef([]);
  const queryImageElement = useRef([]);
  const [srcImage, setSrcImage] = useState([]);
  var faceMatcher = useSelector((user) => user.user.models);
  const dispatch = useDispatch();
  var dataImages;
  const processImagesForRecognition = async (dataImages) => {
    if (!dataImages) return;
    setIsLoading(true);
    let labeledFaceDescriptors = [];
    labeledFaceDescriptors = await Promise.all(
      dataImages?.map(async (imageEleC) => {
        if (imageEleC) {
          const imageEle = new Image();
          imageEle.src = imageEleC.src;
          const label = imageEleC?.name;
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

    setIsLoading(false);
  };

  useEffect(() => {
    if (Object.keys(faceMatcher).length === 0) {
      faceMatcher = JSON.parse(localStorage.getItem("faceMatcher"));
      dispatch(addModels(faceMatcher));
      dataImages = JSON.parse(localStorage.getItem("dataImages"));
      setTimeout(() => {
        processImagesForRecognition(dataImages);
      }, 1000);
    }
    const imageArr = [];
    images.map((item) => {
      fetch(item)
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          let imgURL = URL.createObjectURL(blob);
          const imageEle = new Image();
          imageEle.src = imgURL;
          imageArr.push(imageEle);
          setSrcImage(imageArr);
        });
    });
  }, []);
  const handleQueryImage = (event) => {
    if (event?.target?.files && event?.target?.files[0]) {
      setRecognitionError("");
      const image = event.target.files[0];
      setQueryImage([{ src: URL.createObjectURL(image) }]);
    }
  };

  //   query images
  const loadRecognizedFaces = async () => {
    const resultArr = [];
    if (Object.keys(faceMatcher).length !== 0) {
      setRecognitionError("");
      srcImage?.map(async (imageEle, i) => {
        if (imageEle) {
          const resultsQuery = await detectAllFaces(imageEle)
            .withFaceLandmarks()
            .withFaceDescriptors();
          // await matchDimensions(queryCanvasElement.current[i], imageEle);
          const results = await resizeResults(resultsQuery, {
            width: imageEle.width,
            height: imageEle.height,
          });
          // const queryDrawBoxes =
          results.map((res) => {
            const bestMatch = faceMatcher.findBestMatch(res.descriptor);
            if (bestMatch.label !== "unknown") {
              resultArr.push(imageEle);
              setQueryImage(resultArr);
            } else {
              if (resultArr.length === 0 && srcImage.length - 1 === i) {
                toast.error("No face image found");
              }
            }
            if (srcImage.length - 1 === i) {
              setIsLoading(false);
              console.log("run");
            }
            // return new draw.DrawBox(res.detection.box, {
            //   label: bestMatch.toString(),
            // });
          });
          //   queryDrawBoxes.forEach((drawBox) =>
          //     drawBox.draw(queryCanvasElement.current[i])
          //   );
        }
      });
    } else {
      toast.error("no model face matcher");
    }
  };
  const addImageRef = (index, ref) => {
    queryImageElement.current[index] = ref;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader isLoading={isLoading} />

      <div className={"queryImageSection flex flex-col items-center "}>
        <h4 className="text-green-600 my-4">Query Image</h4>
        <div className="my-6 flex gap-5">
          {queryImage?.map((item, i) => (
            <div key={i} className="">
              <ImageNext
                ref={(queryImageEle) => addImageRef(i, queryImageEle)}
                src={item.src}
                alt="Image to be recognized for face, Face Recognition"
                width={500}
                height={500}
              />
            </div>
          ))}
        </div>
        <label
          htmlFor="queryImage"
          className={"fileUpload border p-2 my-5 border-red-500 "}
        >
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
      {isLoading ? (
        <button
          className="border p-2 mt-5 hover:border-red-700 hover:scale-105"
          disable
        >
          reconising...
        </button>
      ) : (
        <button
          onClick={() => {
            loadRecognizedFaces(), setIsLoading(true);
          }}
          className="border p-2 mt-5 hover:border-red-700 hover:scale-105"
        >
          reconised
        </button>
      )}
    </div>
  );
};

export default QueryDetect;
