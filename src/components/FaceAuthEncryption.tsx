"use client";
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Key } from "lucide-react";
import CryptoJS from "crypto-js";

interface FaceAuthEncryptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletData: {
    privateKey: string;
    seedPhrase: string;
  } | null;
  onEncryptionComplete: () => void;
}

const MODEL_URL =
  "https://raw.githubusercontent.com/vladmandic/face-api/master/model";

const loadFaceDetectionModels = async () => {
  try {
    console.log("Loading face-api.js models...");

    // Check if models are already loaded
    const modelsLoaded =
      faceapi.nets.tinyFaceDetector.isLoaded &&
      faceapi.nets.faceLandmark68Net.isLoaded &&
      faceapi.nets.faceRecognitionNet.isLoaded;

    if (!modelsLoaded) {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          `${MODEL_URL}/tiny_face_detector_model-weights_manifest.json`
        ),
        faceapi.nets.faceLandmark68Net.loadFromUri(
          `${MODEL_URL}/face_landmark_68_model-weights_manifest.json`
        ),
        faceapi.nets.faceRecognitionNet.loadFromUri(
          `${MODEL_URL}/face_recognition_model-weights_manifest.json`
        ),
      ]);
      console.log("Successfully loaded all models");
    } else {
      console.log("Models already loaded");
    }

    return true;
  } catch (error) {
    console.error("Error loading models:", error);
    return false;
  }
};

export default function FaceAuthEncryption({
  open,
  onOpenChange,
  walletData,
  onEncryptionComplete,
}: FaceAuthEncryptionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Load models when component mounts
  useEffect(() => {
    if (!open) return;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Load models
        const success = await loadFaceDetectionModels();
        if (!success) {
          throw new Error("Failed to load face recognition models");
        }

        setModelsLoaded(true);

        // Start video
        await startVideo();
      } catch (err) {
        console.error("Initialization error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize face recognition"
        );
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [open]);

  // Face detection effect
  useEffect(() => {
    if (!videoReady || !modelsLoaded || !open) return;

    console.log("Starting face detection...");

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Use a more reliable face detection method with lower threshold
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.2, // Even lower threshold
            })
          )
          .withFaceLandmarks();

        if (detections) {
          console.log(
            "Face detected with confidence:",
            detections.detection.score
          );
          setFaceDetected(true);

          // Draw face detection results
          const canvas = canvasRef.current;
          const displaySize = {
            width: videoRef.current.width,
            height: videoRef.current.height,
          };
          faceapi.matchDimensions(canvas, displaySize);

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        } else {
          setFaceDetected(false);
          // Clear canvas when no face is detected
          const canvas = canvasRef.current;
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (error) {
        console.error("Error in face detection:", error);
        // Don't set error state here to avoid UI disruption
      }
    };

    // Run face detection more frequently
    const interval = setInterval(detectFace, 100);
    return () => clearInterval(interval);
  }, [videoReady, modelsLoaded, open]);

  const startVideo = async () => {
    try {
      console.log("Requesting camera access...");

      // Check if videoRef is available
      if (!videoRef.current) {
        console.error(
          "Video element not found in startVideo - videoRef is null"
        );
        setError(
          "Failed to initialize camera. Please refresh the page and try again."
        );
        setIsLoading(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      console.log("Camera access granted, setting up video stream...");
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element not found"));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error("Video initialization timeout"));
        }, 10000); // 10 second timeout

        videoRef.current!.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };

        videoRef.current!.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`Video error: ${error}`));
        };
      });

      // Ensure video is playing
      if (videoRef.current.paused) {
        console.log("Video is paused, attempting to play...");
        try {
          await videoRef.current.play();
          console.log("Video started playing successfully");
        } catch (playError) {
          console.error("Error playing video:", playError);
          throw new Error("Failed to start video playback");
        }
      }

      console.log("Video stream initialized successfully");
      setVideoReady(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setError(
        err instanceof Error
          ? `Camera access failed: ${err.message}`
          : "Failed to access camera. Please make sure you have granted camera permissions."
      );
      setIsLoading(false);
    }
  };

  const generateEncryptionKey = async () => {
    if (!videoRef.current || !faceDetected) {
      console.error(
        "Cannot generate encryption key: video not ready or no face detected"
      );
      return null;
    }

    try {
      console.log("Starting encryption key generation from face data...");
      const faceData = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.3,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!faceData) {
        console.error("No face data available for encryption key generation");
        return null;
      }

      console.log(
        "Face descriptor generated successfully, length:",
        faceData.descriptor.length
      );
      // Convert face descriptor to encryption key
      const faceDescriptor = Array.from(faceData.descriptor);
      const descriptorString = faceDescriptor.join(",");
      const hash = CryptoJS.SHA256(descriptorString).toString();
      console.log(
        "Encryption key generated successfully, length:",
        hash.length
      );
      return hash;
    } catch (error) {
      console.error("Error generating encryption key:", error);
      throw new Error("Failed to generate encryption key from face data");
    }
  };

  const encryptData = async (data: string, key: string) => {
    try {
      console.log("Starting data encryption process...");

      // Generate a random IV
      const iv = CryptoJS.lib.WordArray.random(16);
      console.log("Generated IV:", iv.toString());

      // Encrypt the data using AES
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      console.log("Data encrypted successfully");

      return {
        encryptedData: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Base64),
      };
    } catch (error) {
      console.error("Error during encryption process:", error);
      throw new Error(
        "Failed to encrypt data: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  const handleEncryption = async () => {
    if (!walletData) {
      console.error("No wallet data available for encryption");
      return;
    }

    try {
      console.log("Starting encryption process...");
      setProcessing(true);
      const encryptionKey = await generateEncryptionKey();

      if (!encryptionKey) {
        throw new Error("Failed to generate encryption key from face data");
      }

      console.log("Encrypting wallet data...");
      // Encrypt private key and seed phrase
      const encryptedPrivateKey = await encryptData(
        walletData.privateKey,
        encryptionKey
      );
      const encryptedSeedPhrase = await encryptData(
        walletData.seedPhrase,
        encryptionKey
      );

      console.log("Storing encrypted data in localStorage...");
      // Store encrypted data in localStorage
      localStorage.setItem(
        "encryptedWalletData",
        JSON.stringify({
          privateKey: encryptedPrivateKey,
          seedPhrase: encryptedSeedPhrase,
          timestamp: Date.now(),
        })
      );

      // Also store the original wallet data for re-encryption if needed
      localStorage.setItem("walletData", JSON.stringify(walletData));

      console.log("Storing face descriptor in database...");
      // Store face descriptor in database
      const faceData = await faceapi
        .detectSingleFace(
          videoRef.current!,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.2,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!faceData) {
        throw new Error("Failed to generate face descriptor");
      }

      // Get the JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch("/api/auth/store-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faceDescriptor: Array.from(faceData.descriptor),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to store face descriptor");
      }

      console.log("Encryption process completed successfully");
      onEncryptionComplete();
      onOpenChange(false);
    } catch (err) {
      console.error("Error in encryption process:", err);
      setError(
        err instanceof Error ? err.message : "Failed to encrypt wallet data"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black text-white">
        <DialogHeader>
          <DialogTitle>Secure Your Wallet with Face Authentication</DialogTitle>
          <DialogDescription>
            Look directly at the camera to encrypt your wallet data with facial
            recognition
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full max-w-[480px] mx-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-white text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={480}
            height={360}
            className="rounded-lg"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            width={480}
            height={360}
          />

          {!isLoading && !faceDetected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 rounded-lg p-4">
              <div className="bg-yellow-500 text-white p-2 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-white font-medium text-center mb-2">
                No face detected
              </p>
              <div className="text-white text-sm text-center space-y-1">
                <p>Please position your face in the camera.</p>
                <p>
                  Make sure your face is well-lit and centered in the frame.
                </p>
                <p>Try moving closer to the camera if detection fails.</p>
              </div>
            </div>
          )}

          {faceDetected && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Face Detected
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEncryption}
            disabled={!faceDetected || processing}
            className={`${
              faceDetected
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Encrypting...
              </>
            ) : (
              "Encrypt Wallet Data"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
