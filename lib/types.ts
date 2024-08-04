import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

export interface IncorrectAnswer {
  question: string;
  correctAnswer: string;
  incorrectAnswer: string;
}
export interface QuizState {
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  language: string;
  difficulty: string;
  hint: number;
  incorrectAnswerPickedList: IncorrectAnswer[];
}

export interface Difficulty {
  min: number;
  max: number;
}

export interface QuizQuestion {
  question: string;
  answer: string;
  url: string;
  difficulty: { min: number; max: number };
}
export interface Subtopic {
  name: string;
  quizQuestions?: QuizQuestion[];
  quizMultiQuestions?: QuizMultiQuestion[];
}

export interface QuizMultiQuestion {
  question: string;
  correctAnswers: string[];
  wrongAnswers: string[];
  url: string;
  difficulty: { min: number; max: number };
}

export interface MultiQuizQuestion {
  question: string;
  correctAnswers: string[];
  wrongAnswers: string[];
  url: string;
  difficulty: { min: number; max: number };
}
export interface MultiQuizQuestion {
  question: string;
  correctAnswers: string[];
  wrongAnswers: string[];
  url: string;
  difficulty: { min: number; max: number };
}


export interface Topic {
  mainTopic: string;
  subtopics: Subtopic[];
}

export type QuizResults = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  language: string;
  difficulty: string;
  incorrectAnswerPickedList: IncorrectAnswer[];

};

export interface QuizSettings {
  quizState: QuizState;
  mainTopic: string;
  subtopic: string;
  question: string;
  answers: string[];
  correctAnswers: string[];
  url: string;
  type: 'normal' | 'multi';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}