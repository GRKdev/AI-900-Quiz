'use client'

import { createContext, useContext, useEffect } from 'react';
import { QuizState, IncorrectAnswer } from '@/lib/types';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { usePathname } from 'next/navigation';

interface QuizStateContextType extends QuizState {
    incrementCorrect: () => void;
    decreaseHint: () => void;
    resetQuiz: () => void;
    getAccuracy: () => number;
    setLanguage: (lang: string) => void;
    setDifficulty: (diff: string) => void;
    getCurrentQuizState: () => QuizState;
    updateQuizState: (newState: QuizState) => void;
    addIncorrectAnswer: (incorrectAnswer: IncorrectAnswer) => void;
    getIncorrectAnswerList: () => IncorrectAnswer[];
    clearIncorrectAnswerList: () => void;
    handleIncorrectAnswer: (incorrectAnswer: IncorrectAnswer) => void;
}

const QuizStateContext = createContext<QuizStateContextType | undefined>(undefined);

export const QuizStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [quizState, setQuizState] = useLocalStorage<QuizState>('quizState', {
        language: '',
        difficulty: '',
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalQuestions: 0,
        hint: 0,
        incorrectAnswerPickedList: [],
    });
    const pathname = usePathname();

    useEffect(() => {
        const loadQuizState = () => {
            const isHomePage = pathname === '/';
            if (isHomePage) {
                resetQuiz();
            }
        };
        loadQuizState();
    }, [pathname]);

    const incrementCorrect = () => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            correctAnswers: prev.correctAnswers + 1,
            totalQuestions: prev.totalQuestions + 1,
        }));
    };

    const handleIncorrectAnswer = (incorrectAnswer: IncorrectAnswer) => {
        setQuizState((prev: QuizState) => {
            const newState = {
                ...prev,
                incorrectAnswers: prev.incorrectAnswers + 1,
                totalQuestions: prev.totalQuestions + 1,
                incorrectAnswerPickedList: [...prev.incorrectAnswerPickedList, incorrectAnswer]
            };
            return newState;
        });
    };

    const decreaseHint = () => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            hint: prev.hint > 0 ? prev.hint - 1 : 0,
        }));
    };

    const resetQuiz = () => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalQuestions: 0,
            difficulty: '',
            hint: 0,
            incorrectAnswerPickedList: [],
        }));
    };

    const getAccuracy = () => {
        return quizState.totalQuestions > 0
            ? (quizState.correctAnswers / quizState.totalQuestions) * 100
            : 0;
    };

    const setLanguage = (lang: string) => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            language: lang,
        }));
    };

    const setDifficulty = (diff: string) => {
        let hint = 0;
        switch (diff.toLowerCase()) {
            case 'easy':
                hint = Infinity;
                break;
            case 'intermediate':
                hint = 3;
                break;
            case 'hard':
                hint = 0;
                break;
        }
        setQuizState((prev: QuizState) => ({
            ...prev,
            difficulty: diff,
            hint: hint,
        }));
    };

    const getCurrentQuizState = (): QuizState => {
        console.log("Returning Quiz State:", quizState);
        return quizState;
    };

    const addIncorrectAnswer = (incorrectAnswer: IncorrectAnswer) => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            incorrectAnswerPickedList: [...prev.incorrectAnswerPickedList, incorrectAnswer],
        }));
    };

    const getIncorrectAnswerList = (): IncorrectAnswer[] => {
        return quizState.incorrectAnswerPickedList;
    };

    const clearIncorrectAnswerList = () => {
        setQuizState((prev: QuizState) => ({
            ...prev,
            incorrectAnswerPickedList: [],
        }));
    };

    return (
        <QuizStateContext.Provider
            value={{
                ...quizState,
                incrementCorrect,
                handleIncorrectAnswer,
                decreaseHint,
                resetQuiz,
                getAccuracy,
                setLanguage,
                setDifficulty,
                getCurrentQuizState,
                updateQuizState: setQuizState,
                addIncorrectAnswer,
                getIncorrectAnswerList,
                clearIncorrectAnswerList,
            }}
        >
            {children}
        </QuizStateContext.Provider>
    );
};

export async function getQuizState(clientQuizState?: QuizState): Promise<QuizState> {
    console.log('getQuizState called with:', clientQuizState);
    if (clientQuizState) {
        return clientQuizState;
    }

    return {
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalQuestions: 0,
        language: '',
        difficulty: '',
        hint: 0,
        incorrectAnswerPickedList: [],
    };
}

export const useQuizStateActions = () => {
    const context = useContext(QuizStateContext);
    if (context === undefined) {
        throw new Error('useQuizState must be used within a QuizStateProvider');
    }
    return context;
};