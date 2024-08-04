'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { Message } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useQuizStateActions } from '@/context/QuizStateProvider'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  missingKeys: string[]
}

export function Chat({ id, className, missingKeys }: ChatProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useUIState()
  const [aiState] = useAIState()
  const { submitUserMessage } = useActions()
  const [language] = useState('')
  const [difficulty] = useState('')
  const [initialSelectionMade, setInitialSelectionMade] = useState(false)

  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const { getCurrentQuizState, updateQuizState } = useQuizStateActions()

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  }, [id, setNewChatId])

  useEffect(() => {
    missingKeys.forEach(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  const isSelectionComplete = language !== '' && difficulty !== ''

  const handleSubmit = async (userInput: string) => {
    if (!initialSelectionMade && isSelectionComplete) {
      setInitialSelectionMade(true)
    }

    setMessages((currentMessages: Message[]) => [
      ...currentMessages,
      {
        id: Date.now().toString(),
        content: userInput,
        role: 'user'
      }
    ])

    const quizState = getCurrentQuizState()

    if (!quizState) {
      console.error("Quiz state is undefined. Cannot proceed with submission.")
      toast.error("Failed to get game state. Please try again.")
      return
    }

    try {
      const result = await submitUserMessage(userInput, quizState)
      console.log("Result from submitUserMessage:", result)

      if (!result) {
        throw new Error("No result returned from submitUserMessage")
      }

      const { message, updatedQuizState } = result

      setMessages((currentMessages: Message[]) => [
        ...currentMessages,
        message
      ])

      updateQuizState(updatedQuizState)
    } catch (error) {
      console.error("Error submitting user message:", error)
      toast.error("Failed to submit message. Please try again.")
    }
  }

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
