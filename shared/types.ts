interface MathProblem {
  problem_text: string
  final_answer: number
}

interface ProblemResponse {
  problem: MathProblem
  sessionId: string
}

interface FeedbackResponse {
  feedback: string
  isCorrect: boolean
}

interface MathProblemEntity {
  problem_text: string,
  correct_answer: number
}

interface MathProblemSubmissionEntity {
  session_id: string
  user_answer: number
  is_correct: boolean
  feedback_text: string
}

interface SessionId {
  id: string
}

export {
  type MathProblem,
  type ProblemResponse,
  type FeedbackResponse,
  type MathProblemEntity,
  type MathProblemSubmissionEntity,
  type SessionId,
}