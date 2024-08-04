'use client'

import React, { useState, useMemo } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import { useQuizStateActions } from '@/context/QuizStateProvider'
import { Button, buttonVariants } from '@/components/ui/button'
import { ZoomIn, ArrowRight, HandHelping, BarChart2, Link, Forward } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils'
import { IncorrectAnswer } from '@/lib/types'

interface QuizProps {
    props: {
        text: string;
        options: string[];
        questionType: string;
        questionNumber: number;
        questionTitle: string;
        hintTitle: string;
        explanationTitle: string;
        nextQuestionTitle: string;
        seeResultsTitle: string;
        sourceTitle: string;
        submitTitle: string;
        correctAnswer: number | number[];
        url?: string;
    };
    questionId: string;
}

interface QuestionState {
    selectedAnswer: number | number[] | null;
    hintUsed: boolean;
    explanationShown: boolean;
    nextQuestionClicked: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    const cryptoObj = window.crypto || (window as any).msCrypto;

    for (let i = newArray.length - 1; i > 0; i--) {
        const randomBuffer = new Uint32Array(1);
        cryptoObj.getRandomValues(randomBuffer);
        const j = randomBuffer[0] % (i + 1);
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function Quiz({ props: question }: QuizProps) {
    const [, setMessages] = useUIState();
    const { submitUserMessage } = useActions();
    const {
        incrementCorrect,
        handleIncorrectAnswer,
        decreaseHint,
        hint,
        getCurrentQuizState,
    } = useQuizStateActions();


    const [questionState, setQuestionState] = useState<QuestionState>({
        selectedAnswer: question.questionType === 'multi' ? [] : null,
        hintUsed: false,
        explanationShown: false,
        nextQuestionClicked: false,
    });
    const { shuffledOptions, shuffledIndices } = useMemo(() => {
        const indices = shuffleArray(Array.from({ length: question.options.length }, (_, i) => i));
        const options = indices.map(i => question.options[i]);
        return { shuffledOptions: options, shuffledIndices: indices };
    }, [question.options]);

    const handleAnswer = (index: number) => {
        if (question.questionType === 'normal') {
            handleSingleAnswer(index);
        } else {
            handleMultiAnswer(index);
        }
    };

    const handleSingleAnswer = (index: number) => {
        const originalIndex = shuffledIndices[index];
        setQuestionState(prevState => ({
            ...prevState,
            selectedAnswer: index
        }));

        if (originalIndex === question.correctAnswer) {
            incrementCorrect();
        } else {
            const incorrectAnswer: IncorrectAnswer = {
                question: question.text,
                correctAnswer: question.options[question.correctAnswer as number],
                incorrectAnswer: shuffledOptions[index]
            };
            handleIncorrectAnswer(incorrectAnswer);
        }
    };

    const handleMultiAnswer = (index: number) => {
        setQuestionState(prevState => {
            const selectedAnswers = prevState.selectedAnswer as number[];
            const newSelectedAnswers = selectedAnswers.includes(index)
                ? selectedAnswers.filter(i => i !== index)
                : [...selectedAnswers, index];
            return {
                ...prevState,
                selectedAnswer: newSelectedAnswers
            };
        });
    };
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmitMultiAnswer = () => {
        const selectedAnswers = questionState.selectedAnswer as number[];
        const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];

        const isCorrect = selectedAnswers.length === correctAnswers.length &&
            selectedAnswers.every(answer => correctAnswers.includes(shuffledIndices[answer]));

        if (isCorrect) {
            incrementCorrect();
        } else {
            const incorrectAnswer: IncorrectAnswer = {
                question: question.text,
                correctAnswer: correctAnswers.map(index => question.options[index]).join(', '),
                incorrectAnswer: selectedAnswers.map(index => shuffledOptions[index]).join(', ')
            };
            handleIncorrectAnswer(incorrectAnswer);
        }

        setQuestionState(prevState => ({
            ...prevState,
            explanationShown: true
        }));
        setIsSubmitted(true);
    };

    const handleExplanation = async () => {
        const userMessage = "Provide Explanation from question: " + question.text;
        const quizState = getCurrentQuizState();
        const response = await submitUserMessage(userMessage, quizState);
        setMessages((currentMessages: any) => [...currentMessages, response]);
        setQuestionState(prevState => ({
            ...prevState,
            explanationShown: true
        }));
    };

    const handleClue = async () => {
        if ((hint > 0 || hint === null) && !questionState.hintUsed) {
            const quizState = getCurrentQuizState();
            const response = await submitUserMessage("Provide Clue from previous question", quizState);
            setMessages((currentMessages: any) => [...currentMessages, response]);
            if (hint !== null && hint !== Infinity) {
                decreaseHint();
            }
            setQuestionState(prevState => ({
                ...prevState,
                hintUsed: true
            }));
        }
    };

    const handleNextQuestion = async () => {
        setQuestionState(prevState => ({
            ...prevState,
            nextQuestionClicked: true
        }));
        const quizState = getCurrentQuizState();
        const response = await submitUserMessage("next question please", quizState);
        setMessages((currentMessages: any) => [...currentMessages, response]);
    };

    const handleSeeResults = async () => {
        const quizState = getCurrentQuizState();
        const response = await submitUserMessage("Show me the results and summary please.", quizState);
        setMessages((currentMessages: any) => [...currentMessages, response]);
    };

    const showHintButton = (hint > 0 || hint === null || hint === Infinity) && !questionState.hintUsed &&
        ((question.questionType === 'normal' && questionState.selectedAnswer === null) ||
            (question.questionType === 'multi' && !isSubmitted));

    const quizState = getCurrentQuizState();
    const isFinalQuestion = quizState.totalQuestions === 10;

    const svgPaths = ['/a.svg', '/b.svg', '/c.svg', '/d.svg', '/e.svg'];

    return (
        <div className="flex flex-col gap-4 text-sm">
            <div className="rounded-lg bg-zinc-800 p-4">
                <h2 className="text-sm font-bold font-mono text-zinc-500 text-right">{question.questionTitle} {question.questionNumber}</h2>
                <h3 className="mb-4 text-lg font-semibold text-zinc-200">{question.text}</h3>
                <div className="flex flex-col gap-2">
                    {shuffledOptions.map((option, index) => {
                        if (question.questionType === 'normal') {
                            return (
                                <button
                                    key={index}
                                    className={`rounded-md p-2 text-left transition-colors ${questionState.selectedAnswer === null
                                        ? 'bg-zinc-700 hover:bg-zinc-600'
                                        : questionState.selectedAnswer !== null && shuffledIndices[index] === question.correctAnswer
                                            ? 'bg-emerald-700'
                                            : questionState.selectedAnswer === index
                                                ? 'bg-rose-900'
                                                : 'bg-zinc-700 text-gray-300'
                                        } ${questionState.selectedAnswer !== null &&
                                            shuffledIndices[index] !== question.correctAnswer &&
                                            index !== questionState.selectedAnswer
                                            ? 'text-gray-400'
                                            : ''
                                        }`}
                                    onClick={() => handleAnswer(index)}
                                    disabled={questionState.selectedAnswer !== null}
                                >
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={svgPaths[index]}
                                            alt={`Option ${String.fromCharCode(65 + index)}`}
                                            width={24}
                                            height={24}
                                        />
                                        {option}
                                    </div>
                                </button>
                            );
                        } else {
                            const isSelected = (questionState.selectedAnswer as number[]).includes(index);
                            const isCorrect = Array.isArray(question.correctAnswer) && question.correctAnswer.includes(shuffledIndices[index]);

                            return (
                                <button
                                    key={index}
                                    className={`rounded-md p-2 text-left transition-colors ${isCorrect && isSubmitted
                                        ? "bg-emerald-700"
                                        : isSelected && isSubmitted && !isCorrect
                                            ? "bg-rose-900"
                                            : isSelected
                                                ? "bg-zinc-700 hover:bg-zinc-600"
                                                : "bg-zinc-700 hover:bg-zinc-600"
                                        } ${isSubmitted && !isSelected
                                            ? "text-gray-400"
                                            : ""
                                        }`}
                                    onClick={() => !isSubmitted && handleAnswer(index)}
                                    disabled={isSubmitted}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }}
                                            disabled={isSubmitted}
                                            className="form-checkbox h-5 w-5 bg-options"
                                        />
                                        {option}
                                    </div>
                                </button>
                            );
                        }
                    })}
                </div>

            </div>
            <div className="flex justify-between items-center">
                {question.questionType === 'multi' && !isSubmitted && (
                    <Button
                        variant="default"
                        onClick={handleSubmitMultiAnswer}
                        className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                        disabled={(questionState.selectedAnswer as number[]).length === 0}
                    >
                        {question.submitTitle}<Forward className="size-4 ml-1" />
                    </Button>
                )}

                {showHintButton && (
                    <Button
                        variant="default"
                        onClick={handleClue}
                        className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                    >
                        <HandHelping className="size-4 mr-1" />
                        {question.hintTitle} {hint === null || hint === Infinity ? "(∞)" : `(${hint})`}
                    </Button>
                )}
                {((question.questionType === 'normal' && questionState.selectedAnswer !== null) ||
                    (question.questionType === 'multi' && isSubmitted)) &&
                    !questionState.nextQuestionClicked && (
                        <div className="flex justify-between w-full">
                            {isFinalQuestion && questionState.selectedAnswer !== null && (
                                <Button
                                    variant="default"
                                    onClick={handleSeeResults}
                                    className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                                >
                                    <BarChart2 className="size-4 mr-1" /><span className="hidden md:flex">{question.seeResultsTitle}</span>
                                </Button>
                            )}
                            {!isFinalQuestion && (
                                <Button
                                    variant="default"
                                    onClick={handleNextQuestion}
                                    className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                                >
                                    {question.nextQuestionTitle} <ArrowRight className="size-4 ml-1" />
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    onClick={handleExplanation}
                                    className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                                >
                                    <ZoomIn className="size-4 mr-1" /><span className="hidden md:flex">{question.explanationTitle}</span>
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={question.url ? () => window.open(question.url, "_blank") : () => { }}
                                    className={cn(buttonVariants({ variant: "quiz", size: "sm" }))}
                                >
                                    <Link className="size-4 mr-1" /><span className="hidden md:flex">{question.sourceTitle}</span>
                                </Button>
                            </div>

                        </div>
                    )}

            </div>
        </div>
    );
}