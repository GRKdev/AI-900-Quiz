import { Topic, Subtopic, QuizQuestion, QuizMultiQuestion } from "@/lib/types";
import topicsData from './questions.json';

const topics: Topic[] = topicsData.questions;

function getDifficultyLevel(difficulty: string): number {
    switch (difficulty) {
        case 'easy':
            return 1;
        case 'intermediate':
            return 2;
        case 'hard':
            return 3;
        default:
            return 2;
    }
}

export function getRandomMainTopic(): string {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex].mainTopic;
}

export function getRandomSubtopic(mainTopic: string): Subtopic {
    const topic = topics.find(t => t.mainTopic === mainTopic);
    if (!topic) {
        console.error(`Main topic "${mainTopic}" not found. Selecting a random topic.`);
        return getRandomSubtopic(getRandomMainTopic());
    }
    const randomIndex = Math.floor(Math.random() * topic.subtopics.length);
    return topic.subtopics[randomIndex];
}

function getRandomSingleQuestion(subtopic: Subtopic, difficulty: string): QuizQuestion {
    if (!subtopic.quizQuestions || subtopic.quizQuestions.length === 0) {
        console.error("Subtopic has no single-answer quiz questions. Returning empty object.");
        return { question: "", answer: "", url: "", difficulty: { min: 0, max: 0 } };
    }

    const difficultyLevel = getDifficultyLevel(difficulty);
    const eligibleQuestions = subtopic.quizQuestions.filter(question =>
        difficultyLevel >= question.difficulty.min && difficultyLevel <= question.difficulty.max
    );

    if (eligibleQuestions.length === 0) {
        console.warn("No eligible single-answer questions for the given difficulty. Returning a random question.");
        const randomIndex = Math.floor(Math.random() * subtopic.quizQuestions.length);
        return subtopic.quizQuestions[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * eligibleQuestions.length);
    return eligibleQuestions[randomIndex];
}

function getRandomMultiQuestion(subtopic: Subtopic, difficulty: string): QuizMultiQuestion {
    if (!subtopic.quizMultiQuestions || subtopic.quizMultiQuestions.length === 0) {
        console.error("Subtopic has no multi-answer quiz questions. Returning empty object.");
        return {
            question: "",
            correctAnswers: [],
            wrongAnswers: [],
            url: "",
            difficulty: { min: 0, max: 0 }
        };
    }

    const difficultyLevel = getDifficultyLevel(difficulty);
    const eligibleQuestions = subtopic.quizMultiQuestions.filter(question =>
        difficultyLevel >= question.difficulty.min && difficultyLevel <= question.difficulty.max
    );

    if (eligibleQuestions.length === 0) {
        console.warn("No eligible multi-answer questions for the given difficulty. Returning a random question.");
        const randomIndex = Math.floor(Math.random() * subtopic.quizMultiQuestions.length);
        return subtopic.quizMultiQuestions[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * eligibleQuestions.length);
    return eligibleQuestions[randomIndex];
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getTopic(difficulty: string): {
    mainTopic: string,
    subtopic: string,
    question: string,
    answers: string[],
    correctAnswers: string[],
    url: string,
    type: 'normal' | 'multi'
} {
    const mainTopic = getRandomMainTopic();
    const subtopic = getRandomSubtopic(mainTopic);

    const isMultiQuestion = Math.random() < 0.5;

    if (isMultiQuestion && subtopic.quizMultiQuestions && subtopic.quizMultiQuestions.length > 0) {
        const quizQuestion = getRandomMultiQuestion(subtopic, difficulty);
        const allAnswers = shuffleArray([...quizQuestion.correctAnswers, ...quizQuestion.wrongAnswers]);

        return {
            mainTopic,
            subtopic: subtopic.name,
            question: quizQuestion.question,
            answers: allAnswers,
            correctAnswers: quizQuestion.correctAnswers,
            url: quizQuestion.url,
            type: 'multi'
        };
    } else {
        const quizQuestion = getRandomSingleQuestion(subtopic, difficulty);

        return {
            mainTopic,
            subtopic: subtopic.name,
            question: quizQuestion.question,
            answers: [quizQuestion.answer],
            correctAnswers: [quizQuestion.answer],
            url: quizQuestion.url,
            type: 'normal'
        };
    }
}