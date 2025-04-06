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
    
    // Parse the request body
    const body = await req.json();
    const { faceDescriptor } = body;
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor data" },
        { status: 400 }
      );
    }
    
    // Store the face descriptor in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        faceDescriptor: JSON.stringify(faceDescriptor),
        faceAuthEnabled: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Face descriptor stored successfully",
    });
  } catch (error) {
    console.error("Error storing face descriptor:", error);
    return NextResponse.json(
      { error: "Failed to store face descriptor" },
      { status: 500 }
    );
  }
} 