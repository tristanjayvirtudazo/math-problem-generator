import { join } from "path"

// Constants
export const AI_MODEL_NAME = process.env.AI_MODEL_NAME || "gemini-2.5-flash"
export const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "30000", 10)
export const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || "2", 10)
export const RULESET_FILE_PATH = join(process.cwd(), "math-syllabus-ruleset.md")
export const ANSWER_TOLERANCE = 0.001 // Tolerance for floating-point comparison
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i