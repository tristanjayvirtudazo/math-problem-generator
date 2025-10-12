import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { saveProblemAndGetSessionId } from "@/lib/supabaseClient"
import { readFileSync } from "fs"
import { join } from "path"
import { MathProblem, ProblemResponse } from "@/shared/types"

export async function POST() {
  try {
    // Generate Problem
    const aiProblem = await generaterProblem()

    // Validate AI response structure
    validateResponseStructure(aiProblem)

    // Save to Supabase
    const { data, error } = await saveProblemAndGetSessionId(aiProblem)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to save problem to database" },
        { status: 500 }
      )
    }

    // Return response
    const problemResponse: ProblemResponse = {
      problem: aiProblem,
      sessionId: data.id,
    }

    return NextResponse.json(problemResponse, { status: 200 })
  } catch (error) {
    console.error("Error generating math problem:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const generaterProblem = async (): Promise<MathProblem> => {
  // Init Gemini
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    const error = new Error("No API Key configured")
    console.error(error)
    throw error
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  // Load math syllabus ruleset
  const rulesetPath = join(process.cwd(), "math-syllabus-ruleset.md")
  const rulesetContent = readFileSync(rulesetPath, "utf-8")

  // Create prompt for Primary 5 level math problem
  const prompt = `${rulesetContent}

      Based on the rules above, generate ONE math word problem for Primary 5 students.

      Do not include any markdown formatting, code blocks, or additional text. 
      Only return the raw JSON object.`

  // Generate problem with AI
  const result = await model.generateContent(prompt)
  const jsonString = sanitizeText(result.response.text())
  const value = JSON.parse(jsonString) as MathProblem
  
  return value
}

const validateResponseStructure = (problem: MathProblem) => {
   if (!problem.problem_text || isNaN(problem.final_answer)) {
      throw new Error("Invalid problem format from AI")
    }
}

const sanitizeText = (text: string) => 
  text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
