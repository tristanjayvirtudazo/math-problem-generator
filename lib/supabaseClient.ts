import { MathProblemEntity, MathProblemSubmissionEntity, MathProblem, SessionId } from '@/shared/types';
import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      math_problem_sessions: {
        Row: {
          id: string
          created_at: string
          problem_text: string
          correct_answer: number
        }
        Insert: {
          id?: string
          created_at?: string
          problem_text: string
          correct_answer: number
        }
        Update: {
          id?: string
          created_at?: string
          problem_text?: string
          correct_answer?: number
        }
      }
      math_problem_submissions: {
        Row: {
          id: string
          session_id: string
          user_answer: number
          is_correct: boolean
          feedback_text: string
        }
        Insert: {
          id?: string
          session_id: string
          user_answer: number
          is_correct: boolean
          feedback_text: string
        }
        Update: {
          id?: string
          session_id?: string
          user_answer?: number
          is_correct?: boolean
          feedback_text?: string
        }
      }
    }
  }
}

/** Query Methods */

// GET
export const getProblem = async (id: string): Promise<PostgrestSingleResponse<MathProblemEntity>> => 
    await supabase
        .from("math_problem_sessions")
        .select("problem_text, correct_answer")
        .eq("id", id)
        .single<MathProblemEntity>()

// POST
export const saveAnswer = async (answer: MathProblemSubmissionEntity): Promise<PostgrestSingleResponse<MathProblemEntity>> =>
    await supabase
      .from("math_problem_submissions")
      .insert<MathProblemSubmissionEntity>(answer)

// POST with Return
export const saveProblemAndGetSessionId = async (problem: MathProblem): Promise<PostgrestSingleResponse<SessionId>> =>
  await supabase
        .from("math_problem_sessions")
        .insert({
          problem_text: problem.problem_text,
          correct_answer: problem.final_answer,
        })
        .select("id")
        .single<SessionId>()