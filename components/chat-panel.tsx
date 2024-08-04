import React, { useEffect } from 'react'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { FooterText } from '@/components/footer'
import { useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuizStateActions, } from '@/context/QuizStateProvider'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
  onSubmit: (message: string) => void
}

export function ChatPanel({
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
}: ChatPanelProps) {
  const [messages] = useUIState<typeof AI>()
  const { language, setLanguage, difficulty, setDifficulty } = useQuizStateActions()
  const [isSelectionComplete, setIsSelectionComplete] = React.useState(false)

  const languages = ['English', 'Spanish', 'Catalan', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish', 'Russian', 'Turkish', 'Arabic', 'Hindi', 'Chinese', 'Japanese', 'Korean']
  const difficulties = ['Easy', 'Intermediate', 'Hard']

  const showSelectors = messages.length === 0

  useEffect(() => {
    setIsSelectionComplete(language !== '' && difficulty !== '')
  }, [language, difficulty])

  const handleLanguageChange = async (value: string) => {
    setLanguage(value)
  }

  const handleDifficultyChange = async (value: string) => {
    setDifficulty(value)
  }
  return (
    <div className="fixed inset-x-0 bottom-0 w-full peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        {showSelectors && (
          <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
            <div className="col-span-2 md:col-span-1 bg-options rounded-md">
              <Select
                onValueChange={handleLanguageChange}
                value={language}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Quiz Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-1 bg-options rounded-md">
              <Select
                onValueChange={handleDifficultyChange}
                value={difficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          {isSelectionComplete ? (
            <PromptForm
              input={input}
              setInput={setInput}
            />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Please select both language and difficulty to start chatting.
            </div>
          )}
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}