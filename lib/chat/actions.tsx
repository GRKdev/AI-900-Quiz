import 'server-only'

import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai'
import {
  BotCard,
  BotMessage,
} from '@/components/questions'
import { z } from 'zod'
import { QuizSkeleton } from '@/components/questions/quiz-skeleton'
import { Quiz } from '@/components/questions/quiz'
import {
  sleep,
  nanoid
} from '@/lib/utils'
import { SpinnerMessage, UserMessage } from '@/components/questions/message'
import { Chat, Message, TokenUsage } from '@/lib/types'
import { Score } from '@/components/questions/score'
import ResetQuiz from '../hooks/use-reset-game'
import { getQuizCompletionSystemMessage, getSystemMessage } from './system-messages'
import { getTopic } from './question-manager'
import { QuizState } from '@/lib/types';
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

async function submitUserMessage(content: string, quizState: QuizState) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  const { correctAnswers, incorrectAnswers, totalQuestions, language, difficulty, hint } = quizState;
  const { mainTopic, subtopic, question, answers, correctAnswers: topicCorrectAnswers, url, type } = getTopic(difficulty);
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  console.log('language:', language, 'difficulty:', difficulty, 'correctAnswers:', correctAnswers, 'incorrectAnswers:', incorrectAnswers, 'totalQuestions:', totalQuestions, 'accuracy:', accuracy, 'hint:', hint);

  const generateQuestionId = (questionNumber: number) => `question-${questionNumber}`;

  const systemMessage = getSystemMessage({
    quizState,
    mainTopic,
    subtopic,
    question,
    answers,
    correctAnswers: topicCorrectAnswers,
    url,
    type
  });

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: content
      }
    ]
  });
  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  let tokenUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  }

  if (totalQuestions >= 10) {
    const result = await streamUI({
      model: openai('gpt-4o-mini'),
      initial: <SpinnerMessage />,
      temperature: 0,
      system: getQuizCompletionSystemMessage(quizState),
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      onFinish: ({ usage }) => {
        tokenUsage = {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens
        }
        console.log('Token usage:', tokenUsage)
      },
      tools: {
        resetQuiz: {
          description: 'Start a new quiz game when the user requests it.',
          parameters: z.object({}),
          generate: async function* () {
            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'resetQuiz',
                      toolCallId,
                      args: {}
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'resetQuiz',
                      toolCallId,
                      result: 'Quiz reset initiated.'
                    }
                  ]
                }
              ]
            })

            return <ResetQuiz />;
          }
        },
      }
    })
    return {
      id: nanoid(),
      display: result.value
    }
  }

  const result = await streamUI({
    model: openai('gpt-4o-mini'),
    temperature: 0,
    initial: <SpinnerMessage />,
    system: systemMessage,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    onFinish: ({ usage }) => {
      tokenUsage = {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens
      }
      console.log('Token usage:', tokenUsage)
    },
    tools: {
      presentNextQuestion: {
        description: 'Generate a new question for the AI-900 exam preparation game',
        parameters: z.object({
          question: z.object({
            questionType: z.string().describe('The type of the question. Can be "normal" for single choice or "multi" for multiple choice answers (used ALWAYS if u see wrong answers)'),
            questionNumber: z.number().describe('The number of the question in the quiz'),
            questionTitle: z.string().describe('The word Question, (in the user\'s language)'),
            hintTitle: z.string().describe('The word Hint, (in the user\'s language)'),
            explanationTitle: z.string().describe('The word Explanation, (in the user\'s language)'),
            nextQuestionTitle: z.string().describe('The word Next Question, (in the user\'s language)'),
            seeResultsTitle: z.string().describe('The word See Results, (in the user\'s language)'),
            submitTitle: z.string().describe('The word Submit Answer, (in the user\'s language)'),
            sourceTitle: z.string().describe('The word Source, (in the user\'s language)'),
            text: z.string().describe('The text of the question'),
            options: z.array(z.string())
              .refine(arr => arr.length === 4 || arr.length === 5, {
                message: 'Options must be an array of 4 strings for normal questions or 5 strings for multi-choice questions'
              })
              .describe('Generate answers for the question. For normal questions, this will be an array of 4 strings (1 correct, 3 wrongs). For multiple choice questions, this will be an array of 5 strings (2-3 correct, 2-3 wrongs)'),
            correctAnswer: z.union([z.number(), z.array(z.number())])
              .refine(
                (val) => (typeof val === 'number' && val >= 0 && val < 4) || (Array.isArray(val) && val.every(n => n >= 0 && n < 5) && val.length >= 2 && val.length <= 3),
                {
                  message: 'correctAnswer must be a number 0-3 for normal questions or an array of 2-3 numbers 0-4 for multi-choice questions'
                }
              )
              .describe('The index or indices of the correct answer(s)'),
            url: z.string().optional().describe('The source url of the question')
          })
        }),
        generate: async function* ({ question }) {
          if (!question) {
            throw new Error('Question object is undefined');
          }

          yield (
            <BotCard>
              <QuizSkeleton />
            </BotCard>
          )

          await sleep(400)
          // console.log('question result from tool:', question)
          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'presentNextQuestion',
                    toolCallId,
                    args: { question }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'presentNextQuestion',
                    toolCallId,
                    result: question
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Quiz
                props={question}
                questionId={generateQuestionId(question.questionNumber)}
              />
            </BotCard>
          )
        }
      },
      displayCurrentScore: {
        description: 'Display current score only when requested by the user.',
        parameters: z.object({}),
        generate: async function* () {

          return (
            <BotCard>
              <Score />
            </BotCard>
          )
        }
      },
      provideHint: {
        description: 'Provide a hint for the current question when requested by the user.',
        parameters: z.object({
          hint: z.string().describe('The hint for the current question')
        }),
        generate: async function* ({ hint }) {
          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'provideHint',
                    toolCallId,
                    args: { hint }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'provideHint',
                    toolCallId,
                    result: hint
                  }
                ]
              }
            ]
          })

          return <BotMessage content={hint} />
        }
      },
      provideExplanation: {
        description: 'Provide a detailed explanation of the previous question when requested by the user.',
        parameters: z.object({
          prompt: z.string().describe('The prompt for generating the explanation'),
          answer: z.string().describe('The correct answer to the previous question')
        }),
        generate: async function* ({ prompt, answer }) {
          try {
            const result = await generateExplanation(prompt, answer);
            let accumulatedText = '';

            for await (const chunk of result.textStream) {
              accumulatedText += chunk;
              yield <BotMessage content={accumulatedText} />;
            }

            const toolCallId = nanoid();

            aiState.update({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'provideExplanation',
                      toolCallId,
                      args: { prompt }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'provideExplanation',
                      toolCallId,
                      result: accumulatedText
                    }
                  ]
                }
              ]
            });

            return <BotMessage content={accumulatedText} />;
          } catch (error) {
            console.error('Error in provideExplanation:', error);
            return <BotMessage content="Sorry, I couldn't generate an explanation. Please try again." />;
          }
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value,
  }
}

async function generateExplanation(prompt: string, answer: string) {
  try {
    const result = await streamText({
      // model: groq('llama-3.1-70b-versatile'),
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: `Provide a detailed explanation of the previous question when requested by the user.\n\nQuestion: ${prompt}\n\nAnswer: ${answer}` },
        { role: 'user', content: prompt }
      ],

      onFinish: ({ usage }) => {
        console.log('Token usage:', usage);
      },
    });

    return result;
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
}


export type AIState = {
  chatId: string
  messages: Message[]
  language?: string
  difficulty?: string
}
export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'provideHint' ? (
              <BotMessage content={tool.result as string} />
            ) : tool.toolName === 'provideExplanation' ? (
              <BotMessage content={tool.result as string} />
            ) : tool.toolName === 'presentNextQuestion' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Quiz props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
