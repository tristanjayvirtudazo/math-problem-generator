import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { saveProblemAndGetSessionId } from "@/lib/supabaseClient"
import { readFileSync } from "fs"
import { MathProblem, ProblemResponse } from "@/shared/types"
import { AIGenerationError, ValidationError } from "@/shared/errors"
import { AI_MAX_RETRIES, AI_MODEL_NAME, AI_TIMEOUT_MS, RULESET_FILE_PATH } from "@/shared/constants"

// Cache ruleset content at module level (loaded once)
let cachedRulesetContent: string | null = null
const apiKey = process.env.GOOGLE_API_KEY

if (!apiKey) {
  throw new Error("Error : No API Key provided")
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: AI_MODEL_NAME })

export async function POST() {
  try {
    // Generate Problem
    const aiProblem = await generateProblem()

    // Validate AI response structure
    validateResponseStructure(aiProblem)

    // Sanitize content for XSS protection
    const sanitizedProblem = sanitizeProblemContent(aiProblem)

    // Save to Supabase
    const { data, error } = await saveProblemAndGetSessionId(sanitizedProblem)

    if (error) {
      console.error("[ERROR] Database error:", error)
      return NextResponse.json(
        { error: "Failed to save problem to database" },
        { status: 500 }
      )
    }

    // Return response
    const problemResponse: ProblemResponse = {
      problem: sanitizedProblem,
      sessionId: data.id,
    }

    return NextResponse.json(problemResponse, { status: 200 })
  } catch (error) {

    if (error instanceof ValidationError) {
      console.error(`[ERROR] Validation failed :`, error.message)
      return NextResponse.json(
        { error: "Generated problem failed validation" },
        { status: 422 }
      )
    }

    if (error instanceof AIGenerationError) {
      console.error(`[ERROR] AI generation failed:`, error.message, error.cause)
      return NextResponse.json(
        { error: "Failed to generate math problem" },
        { status: 503 }
      )
    }

    console.error(`[ERROR] Unexpected error:`, error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const loadRulesetContent = (): string => {
  if (!cachedRulesetContent) {
    try {
      cachedRulesetContent = readFileSync(RULESET_FILE_PATH, "utf-8")
      console.log("[INFO] Math syllabus ruleset loaded successfully")
    } catch (error) {
      console.error("[ERROR] Failed to load ruleset file:", error)
      throw new Error("Failed to load math syllabus ruleset")
    }
  }
  return cachedRulesetContent
}

/**
 * Generates a math problem using Google's Gemini AI with retry logic and timeout
 */
const generateProblem = async (): Promise<MathProblem> => {
  // Load cached ruleset
  const rulesetContent = loadRulesetContent()

  // Create prompt for Primary 5 level math problem
  const prompt = `${rulesetContent}

Based on the rules above, generate ONE math word problem for Primary 5 students.

Do not include any markdown formatting, code blocks, or additional text.
Only return the raw JSON object.`

  // Generate problem with AI using retry logic
  let lastError: unknown
  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      console.log(`[INFO] AI generation attempt ${attempt}/${AI_MAX_RETRIES}`)

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI request timeout")), AI_TIMEOUT_MS)
        ),
      ])

      const aiResult = result as Awaited<ReturnType<typeof model.generateContent>>
      const jsonString = sanitizeMarkdown(aiResult.response.text())

      // Parse and validate JSON structure
      let parsedValue: unknown
      try {
        parsedValue = JSON.parse(jsonString)
      } catch (parseError) {
        throw new AIGenerationError("AI returned invalid JSON", parseError)
      }

      // Runtime type validation
      if (!isValidMathProblem(parsedValue)) {
        throw new AIGenerationError("AI response doesn't match MathProblem schema")
      }

      console.log(`[INFO] AI generation successful on attempt ${attempt}`)
      return parsedValue
    } catch (error) {
      lastError = error
      console.warn(`[WARN] AI generation attempt ${attempt} failed:`, error)

      if (attempt < AI_MAX_RETRIES) {
        // Exponential backoff: wait 1s, then 2s
        const delayMs = 1000 * attempt
        console.log(`[INFO] Retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new AIGenerationError(
    `Failed to generate problem after ${AI_MAX_RETRIES} attempts`,
    lastError
  )
}

/**
 * Runtime type guard for MathProblem
 */
const isValidMathProblem = (value: unknown): value is MathProblem => {
  if (!value || typeof value !== "object") {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.problem_text === "string" &&
    obj.problem_text.trim().length > 0 &&
    typeof obj.final_answer === "number" &&
    !isNaN(obj.final_answer) &&
    isFinite(obj.final_answer)
  )
}

/**
 * Validates the structure and content of the generated problem
 */
const validateResponseStructure = (problem: MathProblem): void => {
  if (!problem.problem_text || typeof problem.problem_text !== "string") {
    throw new ValidationError("Missing or invalid problem_text")
  }

  if (problem.problem_text.trim().length === 0) {
    throw new ValidationError("problem_text cannot be empty")
  }

  if (problem.problem_text.length > 5000) {
    throw new ValidationError("problem_text exceeds maximum length")
  }

  if (typeof problem.final_answer !== "number" || isNaN(problem.final_answer)) {
    throw new ValidationError("Missing or invalid final_answer")
  }

  if (!isFinite(problem.final_answer)) {
    throw new ValidationError("final_answer must be a finite number")
  }
}

/**
 * Sanitizes problem content to prevent XSS attacks
 */
const sanitizeProblemContent = (problem: MathProblem): MathProblem => {
  return {
    problem_text: sanitizeHtml(problem.problem_text),
    final_answer: problem.final_answer,
  }
}

/**
 * Basic XSS sanitization - escapes HTML special characters
 */
const sanitizeHtml = (text: string): string => {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Removes markdown code block formatting from AI responses
 */
const sanitizeMarkdown = (text: string): string =>
  text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
