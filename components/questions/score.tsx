'use client'

import { useQuizStateActions } from '@/context/QuizStateProvider'
import { Frown, Meh, Smile } from 'lucide-react';

export function Score() {
    const quizState = useQuizStateActions()
    const {
        correctAnswers = 0,
        incorrectAnswers = 0,
        totalQuestions = 0,
    } = quizState || {}
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const getIcon = (accuracy: number) => {
        if (accuracy < 50) {
            return <Frown className="size-6 text-red-400" />;
        } else if (accuracy < 70) {
            return <Meh className="size-6 text-yellow-400" />;
        } else {
            return <Smile className="size-6 text-green-600" />;
        }
    };
    const getAccuracyTextColor = (accuracy: number) => {
        if (accuracy < 50) {
            return "text-red-400";
        } else if (accuracy < 70) {
            return "text-yellow-400";
        } else {
            return "text-green-600";
        }
    };
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-zinc-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-zinc-200 mb-4 text-center">Current Score</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400 text-center">Correct Answers</p>
                        <p className="text-2xl font-bold text-green-400 text-center">{correctAnswers}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 text-center">Incorrect Answers</p>
                        <p className="text-2xl font-bold text-red-400 text-center">{incorrectAnswers}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 text-center">Answered Questions</p>
                        <p className="text-2xl font-bold text-blue-400 text-center">{totalQuestions}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 text-center">Accuracy</p>
                        <div className="flex items-center gap-2 justify-center">
                            <p className={`text-2xl font-bold ${getAccuracyTextColor(accuracy)}`}>{Math.round(accuracy)}%</p>
                            {getIcon(accuracy)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};