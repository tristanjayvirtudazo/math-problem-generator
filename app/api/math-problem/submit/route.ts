import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getProblem, saveAnswer } from "@/lib/supabaseClient"
import { FeedbackResponse, MathProblemEntity } from "@/shared/types"

interface SubmissionRequest {
  sessionId: string
  userAnswer: number
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: SubmissionRequest = await request.json()
    const { sessionId, userAnswer } = body

    if (!sessionId || isNaN(userAnswer)) {
      return NextResponse.json(
        { error: "Invalid request: sessionId and answer are required" },
        { status: 400 }
      )
    }

    // Fetch the original problem and correct answer from database
    const { data: sessionData, error: fetchError } = await getProblem(sessionId)

    if (fetchError || !sessionData) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    const { correct_answer } = sessionData

    // Check if the answer is correct
    const isCorrect = Number(userAnswer) === correct_answer

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
      console.error("Database insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      )
    }

    // Return feedback response
    const feedbackResponse: FeedbackResponse = {
      feedback: feedback,
      isCorrect
    }

    return NextResponse.json(feedbackResponse, { status: 200 })
  } catch (error) {
    console.error("Error processing submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const generateFeedback = async (
  isCorrect: boolean, 
  problem: MathProblemEntity,
  userAnswer: number
): Promise<string> => {
  const { problem_text: savedProblem, correct_answer: answer } = problem
  // Init Gemini
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    const error = new Error("No API Key configured")
    console.error(error)
    throw error
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  // Create personalized feedback prompt
  const feedbackPrompt = `
    You are a helpful and encouraging Primary 5 math tutor.

    Problem: ${savedProblem}
    Correct Answer: ${answer}
    Student's Answer: ${userAnswer}
    Result: ${isCorrect ? "Correct" : "Incorrect"}

    Generate brief personalized feedback for the student based on their answer (2-3 sentences).
    - If correct: Praise their work and briefly explain the solution approach.
    - If incorrect: Gently explain where they went wrong and guide them toward the correct answer without being discouraging.

    Return only the feedback text, no additional formatting.`

  // Generate AI feedback
  const result = await model.generateContent(feedbackPrompt)
  const response = result.response
  const feedback = response.text().trim()

  return feedback
}
