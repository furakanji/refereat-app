import { NextRequest, NextResponse } from "next/server";
import genAI from "@/lib/gemini";
import { Booking } from "@/types/firestore";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const text = formData.get("text") as string;

        if (!file && !text) {
            return NextResponse.json(
                { error: "Please provide an image or text to analyze." },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        let prompt = `
      Analyze the provided restaurant booking report or receipt.
      Extract the following information:
      - Guest Name (guestName)
      - Date (bookingDate in ISO format)
      - Number of Covers (covers) - number of people
      - Total Spend (totalSpend) - numeric value, if available.
      
      Return the result as a raw JSON object with keys: guestName, bookingDate, covers, qualityScores, totalSpend.
      Do not include markdown formatting.
    `;

        let result;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = buffer.toString("base64");

            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type,
                },
            };

            result = await model.generateContent([prompt, imagePart]);
        } else {
            result = await model.generateContent([prompt, text]);
        }

        const responseText = result.response.text();

        // Clean up markdown code blocks if present
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("Error processing booking:", error);
        return NextResponse.json(
            { error: "Failed to process booking.", details: error.message },
            { status: 500 }
        );
    }
}
