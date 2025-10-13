'use client'

import { useState } from 'react'
import { FeedbackResponse, ProblemResponse } from '@/shared/types'
import DifficultyOptions from '@/components/DifficultyOptions'
import ProblemTypeOptions from '@/components/ProblemTypeOptions'
interface MathProblem {
  problem_text: string
  final_answer: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isChecking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [problemType, setProblemType] = useState<'addition' | 'subtraction' | 'multiplication' | 'division'>('addition')

  const generateProblem = async () => {
    setIsLoading(true)
    setFeedback('')

    try {
      const requestBody = {
        difficulty,
        problemType
      }
      const response = await fetch('/api/math-problem', {
        method: "POST",
        body: JSON.stringify(requestBody)
      })

      const data = await response.json() as ProblemResponse

      setProblem(data.problem)
      setSessionId(data.sessionId)
      
    } catch (_) {
      setError("Failed to generate problem. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setError(''), 3000)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)

    const requestBody = {
      userAnswer,
      sessionId,
    }

    try {
      const query = await fetch('/api/math-problem/submit', {
        method: "POST",
        body: JSON.stringify(requestBody)
      })
      const data = await query.json() as FeedbackResponse

      setFeedback(data.feedback)
      setIsCorrect(data.isCorrect)
    } catch (error) {
      setError("Failed to check the answer. Please Try Again.")
    } finally {
      setChecking(false)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {error && (
        <header className='max-w-2xl mx-auto pt-2'>
        <p className='text-center py-2 text-sm text-red-400 bg-red-500 bg-opacity-20 border-2 border-red-300 rounded-lg '>
          {error}
        </p>
      </header>
      )}
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Math Problem Generator
        </h1>

        <ProblemTypeOptions selectedTopic={problemType} onSelectTopic={setProblemType} />
        <DifficultyOptions selectedDifficulty={difficulty} onSelectDifficulty={setDifficulty} />
        
        {!isChecking && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <button
              onClick={generateProblem}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
            >
              {isLoading ? 'Generating...' : 'Generate New Problem'}
            </button>
          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <p className="text-sm md:text-lg text-gray-800 leading-relaxed mb-6">
              {problem.problem_text}
            </p>
            
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!userAnswer || isChecking}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                Submit Answer
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}