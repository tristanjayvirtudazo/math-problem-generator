import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getProblem, saveAnswer } from "@/lib/supabaseClient"
import { FeedbackResponse, MathProblemEntity } from "@/shared/types"
import { AIGenerationError, ValidationError } from "@/shared/errors"
import {
  AI_MODEL_NAME,
  AI_TIMEOUT_MS,
  AI_MAX_RETRIES,
  UUID_REGEX,
  ANSWER_TOLERANCE,
} from "@/shared/constants"
interface SubmissionRequest {
  sessionId: string
  userAnswer: number
}

// Initialize Gemini at module level
const apiKey = process.env.GOOGLE_API_KEY

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable not configured")
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: AI_MODEL_NAME })

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: SubmissionRequest = await request.json() as SubmissionRequest
    const { sessionId, userAnswer } = body
    // Validate inputs
    validateSubmissionRequest(sessionId, Number(userAnswer))

    // Fetch the original problem and correct answer from database
    const { data: sessionData, error: fetchError } = await getProblem(sessionId)

    if (fetchError || !sessionData) {
      console.error("[ERROR] Database fetch error:", fetchError)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const { correct_answer } = sessionData

    // Check if the answer is correct (with tolerance for floating-point)
    const isCorrect = isAnswerCorrect(userAnswer, correct_answer)

    // Generate Feedback
    const feedback = await generateFeedback(isCorrect, sessionData, userAnswer)

    // Save submission to database
    const { error: insertError } = await saveAnswer({
      session_id: sessionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      feedback_text: feedback,
    })

    if (insertError) {
      console.error("[ERROR] Database error:", insertError)
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      )
    }

    // Return feedback response
    const feedbackResponse: FeedbackResponse = {
      feedback: feedback,
      isCorrect,
    }

    return NextResponse.json(feedbackResponse, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`[ERROR] Validation failed :`, error.message)
      return NextResponse.json(
        { error: "Generated problem failed validation" },
        { status: 422 }
      )
    }

    if (error instanceof AIGenerationError) {
      console.error("[ERROR] AI generation failed:", error.message, error.cause)
      return NextResponse.json(
        { error: "Failed to generate feedback" },
        { status: 503 }
      )
    }

    console.error("[ERROR] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Validates the submission request parameters
 * @throws Error if validation fails
 */
const validateSubmissionRequest = (
  sessionId: string,
  userAnswer: number
): void => {
  // Validate sessionId
  if (!sessionId || typeof sessionId !== "string") {
    throw new ValidationError("sessionId is required and must be a string")
  }

  if (!UUID_REGEX.test(sessionId)) {
    throw new ValidationError("sessionId must be a valid UUID")
  }

  // Validate userAnswer
  if (typeof userAnswer !== "number") {
    throw new ValidationError("userAnswer must be a number")
  }

  if (isNaN(userAnswer)) {
    throw new ValidationError("userAnswer cannot be NaN")
  }

  if (!isFinite(userAnswer)) {
    throw new ValidationError("userAnswer must be a finite number")
  }
}

/**
 * Compares user answer with correct answer using tolerance for floating-point precision
 */
const isAnswerCorrect = (
  userAnswer: number,
  correctAnswer: number
): boolean => {
  return Math.abs(userAnswer - correctAnswer) < ANSWER_TOLERANCE
}

/**
 * Generates personalized feedback using Google's Gemini AI with retry logic and timeout
 */
const generateFeedback = async (
  isCorrect: boolean,
  problem: MathProblemEntity,
  userAnswer: number
): Promise<string> => {
  const { problem_text: savedProblem, correct_answer: answer } = problem

  // Create personalized feedback prompt
  const feedbackPrompt = `You are a helpful and encouraging Primary 5 math tutor.

Problem: ${savedProblem}
Correct Answer: ${answer}
Student's Answer: ${userAnswer}
Result: ${isCorrect ? "Correct" : "Incorrect"}

Generate brief personalized feedback for the student based on their answer (2-3 sentences).
- If correct: Praise their work and briefly explain the solution approach.
- If incorrect: Gently explain where they went wrong and guide them toward the correct answer without being discouraging.

Return only the feedback text, no additional formatting.`

  // Generate feedback with AI using retry logic
  let lastError: unknown
  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[INFO] AI feedback generation attempt ${attempt}/${AI_MAX_RETRIES}`
      )

      const result = await Promise.race([
        model.generateContent(feedbackPrompt),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AI request timeout")),
            AI_TIMEOUT_MS
          )
        ),
      ])

      const aiResult = result as Awaited<
        ReturnType<typeof model.generateContent>
      >
      const feedback = aiResult.response.text().trim()

      if (!feedback || feedback.length === 0) {
        throw new AIGenerationError("AI returned empty feedback")
      }

      return feedback
    } catch (error) {
      lastError = error
      console.warn(
        `[WARN] AI feedback generation attempt ${attempt} failed:`,
        error
      )

      if (attempt < AI_MAX_RETRIES) {
        // Exponential backoff: wait 1s, then 2s
        const delayMs = 1000 * attempt
        console.log(`[INFO] Retrying in ${delayMs}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new AIGenerationError(
    `Failed to generate feedback after ${AI_MAX_RETRIES} attempts`,
    lastError
  )
}