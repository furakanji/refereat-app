import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API key is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;
