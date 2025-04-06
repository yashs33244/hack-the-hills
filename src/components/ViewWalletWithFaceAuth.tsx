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
import { Loader2 } from "lucide-react";
import CryptoJS from "crypto-js";

interface ViewWalletWithFaceAuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODEL_URL =
  "https://raw.githubusercontent.com/vladmandic/face-api/master/model";

export default function ViewWalletWithFaceAuth({
  open,
  onOpenChange,
}: ViewWalletWithFaceAuthProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [walletData, setWalletData] = useState<{
    privateKey: string;
    seedPhrase: string;
  } | null>(null);

  // Clear wallet data when dialog is closed
  useEffect(() => {
    if (!open) {
      setWalletData(null);
      setError("");
    }
  }, [open]);

  // Function to check if encrypted data is in the correct format
  const isValidEncryptedData = (data: any): boolean => {
    return (
      data &&
      typeof data.iv === "string" &&
      typeof data.encryptedData === "string" &&
      data.iv.length > 0 &&
      data.encryptedData.length > 0
    );
  };

  // Function to decrypt data using crypto-js
  const decryptData = (
    encryptedData: { iv: string; encryptedData: string },
    key: string
  ): string => {
    try {
      console.log("Decrypting data with crypto-js...");

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, key, {
        iv: CryptoJS.enc.Base64.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Convert the decrypted data to a string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      console.log("Data decrypted successfully");

      return decryptedString;
    } catch (error) {
      console.error("Error during decryption process:", error);
      throw new Error("Failed to decrypt data");
    }
  };

  useEffect(() => {
    if (!open) return;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError("");
        console.log("Initializing face recognition...");

        // Load face-api models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        console.log("Face recognition models loaded successfully");
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
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [open]);

  useEffect(() => {
    if (!videoRef.current || !open || !videoReady || !modelsLoaded) return;

    console.log("Starting face detection loop...");

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      // Check if video is actually playing
      if (videoRef.current.paused || videoRef.current.ended) {
        console.log("Video is not playing, attempting to restart...");
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Failed to restart video:", err);
        }
        return;
      }

      try {
        console.log("Detecting face...");
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 160, // Smaller input size for faster detection
              scoreThreshold: 0.1, // Lower threshold for better detection
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

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
          const canvas = canvasRef.current;
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    };

    // Run face detection more frequently
    const interval = setInterval(detectFace, 50);
    return () => clearInterval(interval);
  }, [open, videoReady, modelsLoaded]);

  const startVideo = async () => {
    try {
      console.log("Starting video stream...");

      if (!videoRef.current) {
        console.error("Video element not found");
        throw new Error("Video element not found");
      }

      // Request camera access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      console.log("Camera access granted, setting up video stream");
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
    } catch (err) {
      console.error("Camera access error:", err);
      throw new Error(
        "Failed to access camera. Please make sure you have granted camera permissions."
      );
    }
  };

  const handleVerification = async () => {
    if (!videoRef.current || !faceDetected) {
      console.error("Cannot verify: video not ready or no face detected");
      setError("Please position your face in front of the camera");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      console.log("Starting face verification process...");

      // Get current face descriptor
      console.log("Detecting face for verification...");
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
        throw new Error("No face detected during verification");
      }
      console.log(
        "Face detected for verification with confidence:",
        faceData.detection.score
      );

      // Get the JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      console.log("JWT token retrieved successfully");

      // Verify face with backend
      console.log("Sending face descriptor to server for verification...");
      const response = await fetch("/api/auth/verify-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faceDescriptor: Array.from(faceData.descriptor),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Face verification failed:", data.error);
        throw new Error(data.error || "Face verification failed");
      }
      console.log("Face verification successful on server");

      // Get encrypted wallet data from localStorage
      console.log("Retrieving encrypted wallet data from localStorage...");
      const encryptedData = localStorage.getItem("encryptedWalletData");
      if (!encryptedData) {
        throw new Error(
          "No encrypted wallet data found. Please encrypt your wallet data first."
        );
      }

      const {
        privateKey: encryptedPrivateKey,
        seedPhrase: encryptedSeedPhrase,
        timestamp,
      } = JSON.parse(encryptedData);
      console.log("Encrypted wallet data retrieved successfully");

      // Check when the encrypted data was created
      if (timestamp) {
        const daysAgo = Math.floor(
          (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        );
        console.log(`Encrypted data was created ${daysAgo} days ago`);

        // If the data is more than 7 days old, suggest re-encrypting
        if (daysAgo > 7) {
          console.log(
            "Encrypted data is more than 7 days old. Suggesting re-encryption."
          );
          setError(
            "Your encrypted wallet data is more than 7 days old. Please re-encrypt it with your current face."
          );
        }
      }

      // Validate encrypted data structure
      if (
        !isValidEncryptedData(encryptedPrivateKey) ||
        !isValidEncryptedData(encryptedSeedPhrase)
      ) {
        console.error("Invalid encrypted data structure:", {
          privateKey: isValidEncryptedData(encryptedPrivateKey),
          seedPhrase: isValidEncryptedData(encryptedSeedPhrase),
        });
        throw new Error(
          "Encrypted data is corrupted or in an invalid format. Please encrypt your wallet data again."
        );
      }

      // Generate decryption key from face data
      console.log("Generating decryption key from face descriptor...");
      const faceDescriptor = Array.from(faceData.descriptor);
      const descriptorString = faceDescriptor.join(",");
      const decryptionKey = CryptoJS.SHA256(descriptorString).toString();
      console.log(
        "Decryption key generated successfully, length:",
        decryptionKey.length
      );

      // Decrypt wallet data
      console.log("Decrypting private key...");
      try {
        // Log the encrypted data structure for debugging
        console.log("Encrypted private key structure:", encryptedPrivateKey);
        console.log("Decryption key:", decryptionKey);

        // Decrypt the private key
        const privateKey = decryptData(encryptedPrivateKey, decryptionKey);
        console.log("Raw decrypted private key:", privateKey);

        console.log("Decrypting seed phrase...");
        console.log("Encrypted seed phrase structure:", encryptedSeedPhrase);

        // Decrypt the seed phrase
        const seedPhrase = decryptData(encryptedSeedPhrase, decryptionKey);
        console.log("Raw decrypted seed phrase:", seedPhrase);

        // Set the wallet data regardless of empty checks
        setWalletData({
          privateKey: privateKey,
          seedPhrase: seedPhrase,
        });

        console.log("Wallet data set in state:", {
          privateKey: privateKey,
          seedPhrase: seedPhrase,
        });
      } catch (decryptError) {
        console.error("Detailed decryption error:", decryptError);
        // Still set the error but don't throw - allow the UI to update
        setError(
          "Decryption completed but may have issues. Check the displayed data."
        );
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify face");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black text-white">
        <DialogHeader>
          <DialogTitle>View Wallet Keys with Face Authentication</DialogTitle>
          <DialogDescription>
            Look directly at the camera to verify your identity and view your
            wallet keys
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

        {walletData ? (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-white">Private Key (Raw)</h3>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <pre className="text-white break-all font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(walletData.privateKey, null, 2)}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-white">Seed Phrase (Raw)</h3>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <pre className="text-white break-all font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(walletData.seedPhrase, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
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
                  Verifying...
                </>
              ) : (
                "View Wallet Keys"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
