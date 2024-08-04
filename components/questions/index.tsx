'use client'

import dynamic from 'next/dynamic'
import { QuizSkeleton } from './quiz-skeleton'
import { ScoreSkeleton } from './score-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, SystemMessage } from './message'

const Quiz = dynamic(() => import('./quiz').then(mod => mod.Quiz), {
  ssr: false,
  loading: () => <QuizSkeleton />
})

const Score = dynamic(() => import('./score').then(mod => mod.Score), {
  ssr: false,
  loading: () => <ScoreSkeleton />
})


export { Quiz, Score }