// api/ai/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { text, model = "gemini-1.5-pro", length = "medium", tone = "neutral" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Initialize the Gemini API with your API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_API_KEY!);

    // Get the model
    const genModel = genAI.getGenerativeModel({ model });

    // Determine token length based on summary length preference
    let maxOutputTokens = 512;
    if (length === "short") maxOutputTokens = 256;
    else if (length === "detailed") maxOutputTokens = 1536;

    // Set tone instructions
    let toneInstruction = "";
    if (tone === "formal") toneInstruction = " Use a formal tone.";
    else if (tone === "casual") toneInstruction = " Use a casual, conversational tone.";
    else if (tone === "technical") toneInstruction = " Use technical language and precise terminology.";
    else if (tone === "simple") toneInstruction = " Use simple, easy-to-understand language.";

    const prompt = `You are a helpful assistant that summarizes text content. Provide concise but comprehensive summaries that capture the main points and key details.${toneInstruction}
    
    Please summarize the following text in a ${length} length and ${tone} tone:
    
    ${text}`;

    const result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens,
        temperature: 0.5,
      },
    });

    const response = result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in POST /api/summarize:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}