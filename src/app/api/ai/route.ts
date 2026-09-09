import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Academic assistant system instruction
const SYSTEM_INSTRUCTION = `You are DoubtConnect AI — a dedicated academic assistant for college students in India.

Your role is to SUPPORT peer learning, not replace it.

BEHAVIOR GUIDELINES:
- Explain concepts clearly and simply, as if teaching a fellow student
- Always provide step-by-step explanations for problem-solving
- Use practical examples, especially from Indian engineering curricula (like SPPU, VTU, Mumbai University, etc.)
- Help with all standard college subjects: Mathematics, Physics, Chemistry, Computer Science, Electronics, Mechanical Engineering, etc.
- For programming doubts: explain the concept first, then show code with inline comments
- Generate practice questions when asked
- Encourage the student to also ask their seniors on DoubtConnect for deeper understanding
- If a question is completely off-topic (non-academic), politely redirect to academic topics

RESPONSE FORMAT:
- Use markdown formatting: **bold** for key terms, code blocks for code, numbered lists for steps
- Keep responses concise but complete
- End complex explanations with: "💡 Tip: Post this doubt on DoubtConnect to get a senior's real-world perspective too!"

NEVER:
- Do complete assignments or projects for the student
- Give answers without explanation
- Engage with non-academic or inappropriate content`;

export async function POST(req: Request) {
  try {
    // Auth check — only logged-in students can use AI
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to use the AI Assistant.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // API key check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error: "AI Assistant is not configured yet. Please add your GEMINI_API_KEY to your environment variables.",
          code: "MISSING_API_KEY"
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { question, subject, history } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a question.", code: "EMPTY_QUESTION" },
        { status: 400 }
      );
    }

    if (question.trim().length > 2000) {
      return NextResponse.json(
        { error: "Question is too long. Please keep it under 2000 characters.", code: "QUESTION_TOO_LONG" },
        { status: 400 }
      );
    }

    // Build Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Build the contents array for multi-turn conversation
    const contents: any[] = [];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role === "user" || turn.role === "model") {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    // Add subject context to current question if provided
    const enrichedQuestion = subject
      ? `[Subject: ${subject}]\n\n${question.trim()}`
      : question.trim();

    contents.push({
      role: "user",
      parts: [{ text: enrichedQuestion }]
    });

    // Call Gemini with model fallback and a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const modelsToTry = [
      process.env.GEMINI_MODEL,
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ].filter(Boolean) as string[];

    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || "");
        // If it's an auth error, trying other models won't help
        if (
          err?.status === 401 ||
          errStr.includes("UNAUTHENTICATED") ||
          errStr.includes("authentication credentials") ||
          errStr.includes("API key not valid") ||
          errStr.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
        ) {
          break;
        }
        // If it's a 404 model not found, loop to next candidate model
        console.warn(`Gemini model ${modelName} failed, trying fallback...`, errStr.slice(0, 150));
      }
    }

    clearTimeout(timeoutId);

    if (!response?.text) {
      if (lastError) {
        const errStr = String(lastError?.message || "");
        const status = lastError?.status || lastError?.code;

        if (
          status === 401 ||
          errStr.includes("UNAUTHENTICATED") ||
          errStr.includes("authentication") ||
          errStr.includes("API key not valid") ||
          errStr.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
        ) {
          return NextResponse.json(
            {
              error: "Invalid Gemini API Key. Please get a free key from https://aistudio.google.com/app/apikey (starts with 'AIzaSy') and set GEMINI_API_KEY in your environment variables.",
              code: "INVALID_API_KEY"
            },
            { status: 401 }
          );
        }

        if (status === 429 || errStr.includes("quota") || errStr.includes("rate")) {
          return NextResponse.json(
            { error: "AI rate limit reached. Please wait a moment and try again.", code: "RATE_LIMIT" },
            { status: 429 }
          );
        }

        if (status === 400 || errStr.includes("safety")) {
          return NextResponse.json(
            { error: "Your question could not be processed due to safety guidelines. Please rephrase it.", code: "SAFETY_BLOCK" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: "AI could not generate a response. Please check your Gemini API key and try again.", code: "AI_GENERATION_FAILED" },
        { status: 502 }
      );
    }

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try rephrasing your question.", code: "EMPTY_RESPONSE" },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer: text, status: "success" });

  } catch (error: any) {
    console.error("AI API error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again in a moment.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
