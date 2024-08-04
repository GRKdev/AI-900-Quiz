'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { useActions, useUIState } from 'ai/rsc'
import { UserMessage, BotMessage } from './questions/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { useQuizStateActions } from '@/context/QuizStateProvider'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { getCurrentQuizState, updateQuizState } = useQuizStateActions()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: React.FormEvent) => {
        e.preventDefault()

        if (window.innerWidth < 600) {
          inputRef.current?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        const quizState = getCurrentQuizState()
        console.log("Current Quiz State before submit:", quizState)

        // Optimistically add user message UI
        const userMessageId = nanoid()
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: userMessageId,
            role: 'user',
            content: value,
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        try {
          const result = await submitUserMessage(value, quizState)
          console.log("Result from submitUserMessage:", result)

          if (result && result.display) {
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: result.id,
                role: 'assistant',
                content: typeof result.display === 'string' ? result.display : 'AI response',
                display: result.display
              }
            ])
          } else {
            console.error("Invalid response from submitUserMessage:", result)
            throw new Error("Invalid response from AI")
          }

          // Note: updateQuizState should be called here if the game state is updated in submitUserMessage
          // updateQuizState(updatedQuizState)
        } catch (error) {
          console.error("Error submitting user message:", error)
          // Remove the optimistically added user message on error
          setMessages(currentMessages =>
            currentMessages.filter(msg => msg.id !== userMessageId)
          )
          // Add an error message
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: nanoid(),
              role: 'system',
              content: 'An error occurred. Please try again.',
              display: <BotMessage content='An error occurred. Please try again.' />
            }
          ])
        }
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}