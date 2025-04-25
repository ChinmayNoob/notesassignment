// api/ai/models/route.ts
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Gemini models
    const models = {
      data: [
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" }
      ]
    };
    
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}