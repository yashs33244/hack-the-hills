import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get the authorization token from the request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization token" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify the token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Get the user ID from the token payload
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 400 }
      );
    }
    
    // Get the user's stored face descriptor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        faceDescriptor: true,
        faceAuthEnabled: true,
      },
    });
    
    if (!user || !user.faceAuthEnabled || !user.faceDescriptor) {
      return NextResponse.json(
        { error: "Face authentication not set up for this user" },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { faceDescriptor: newFaceDescriptor } = body;
    
    if (!newFaceDescriptor || !Array.isArray(newFaceDescriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor data" },
        { status: 400 }
      );
    }
    
    // Compare face descriptors
    const storedDescriptor = JSON.parse(user.faceDescriptor);
    const distance = euclideanDistance(storedDescriptor, newFaceDescriptor);
    
    // Threshold for face similarity (adjust as needed)
    const SIMILARITY_THRESHOLD = 0.6;
    
    if (distance <= SIMILARITY_THRESHOLD) {
      return NextResponse.json({
        success: true,
        message: "Face verification successful",
      });
    } else {
      return NextResponse.json(
        { error: "Face verification failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verifying face:", error);
    return NextResponse.json(
      { error: "Failed to verify face" },
      { status: 500 }
    );
  }
}

// Helper function to calculate Euclidean distance between face descriptors
function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error("Descriptors must have the same length");
  }
  
  return Math.sqrt(
    descriptor1.reduce((sum, value, index) => {
      const diff = value - descriptor2[index];
      return sum + diff * diff;
    }, 0)
  );
} 