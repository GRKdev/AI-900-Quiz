import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
} from '@/components/ui/icons'
import Image from 'next/image'

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-4 border-b shrink-0 ">
      <div className="flex space-x-4 items-center">
        <a href="/">
          <Image
            src="/badge.svg"
            alt="AI-900 Badge"
            width={40}
            height={40}
          />
        </a>
        <a href="/">
          <h1 className="text-lg font-bold font-mono">AI-900 Quiz</h1>
        </a>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/GRKdev/ai-900-quiz"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>

      </div>
    </header>
  )
}
