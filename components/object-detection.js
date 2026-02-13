"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/render-predictions";


const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const lastPhotoTime = useRef(0);
  const [photos, setPhotos] = useState([]);

  // Feature 2 State: Sensitivity & Controls
  const [volume, setVolume] = useState(true);
  const [target, setTarget] = useState("person");
  const [threshold, setThreshold] = useState(0.6);

  // Refs for loop access to avoid stale closures
  const volumeRef = useRef(volume);
  const targetRef = useRef(target);
  const thresholdRef = useRef(threshold);

  useEffect(() => {
    volumeRef.current = volume;
    targetRef.current = target;
    thresholdRef.current = threshold;
  }, [volume, target, threshold]);

  async function runCoco() {
    setIsLoading(true); // Set loading state to true when model loading starts
    const net = await cocoSSDLoad();
    setIsLoading(false); // Set loading state to false when model loading completes

    intervalRef.current = setInterval(() => {
      runObjectDetection(net); // will build this next
    }, 10);
  }

  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      // find detected objects
      const detectedObjects = await net.detect(
        webcamRef.current.video,
        undefined,
        thresholdRef.current
      );

      // Auto-capture mugshot logic
      if (detectedObjects.some((obj) => obj.class.toLowerCase() === targetRef.current.toLowerCase())) {
        const now = Date.now();
        // Throttle to capture every 4 seconds to avoid spam
        if (now - lastPhotoTime.current > 4000) {
          const screenshot = webcamRef.current.getScreenshot();
          if (screenshot) {
            setPhotos((prev) => [screenshot, ...prev]);
            lastPhotoTime.current = now;
          }
        }
      }

      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, context, targetRef.current, volumeRef.current);
    }
  }

  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  useEffect(() => {
    runCoco();
    showmyVideo();
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex flex-col items-center">

          {/* Control Panel */}
          <div className="glass-card p-4 mb-6 w-full max-w-lg flex flex-col gap-4 text-white z-10">
            <div className="flex justify-between items-center">
              <label className="font-bold text-lg">Target Object:</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-red-500"
                placeholder="e.g. person, cup"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="font-bold text-lg">Alarm Volume:</label>
              <button
                onClick={() => setVolume(!volume)}
                className={`px-4 py-1 rounded font-bold transition ${volume ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
                {volume ? "On" : "Off"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="font-bold">Sensitivity: {Math.round(threshold * 100)}%</label>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          <div className="relative flex justify-center items-center gradient p-1.5 rounded-md shadow-2xl">
            {/* webcam */}
            <Webcam
              ref={webcamRef}
              className="rounded-md w-full lg:h-[720px]"
              muted
            />
            {/* canvas */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
            />
          </div>
        </div>
      )}

      {/* Gallery of captured mugshots */}
      {photos.length > 0 && (
        <div className="mt-10 w-full">
          <h2 className="text-2xl font-bold mb-4 gradient-text">
            Intruder Mugshots
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Intruder ${index + 1}`}
                  className="w-full h-auto rounded-lg border-2 border-red-500 shadow-md transform transition hover:scale-105 duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Captured
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
