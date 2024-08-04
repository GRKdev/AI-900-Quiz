import { ExternalLink } from '@/components/external-link'
import Image from 'next/image'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-4 rounded-lg border p-8 bg-background">
        <div className="flex justify-center mb-4">
          <Image
            src="/badge.svg"
            alt="AI-900 Badge"
            width={100}
            height={100}
          />
        </div>
        <h1 className="text-lg font-semibold text-center">
          Welcome to AI-900 Certification Quiz Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is a training quiz for the{' '}
          <ExternalLink href="https://learn.microsoft.com/es-es/credentials/certifications/azure-ai-fundamentals/?practice-assessment-type=certification">
            Microsoft AI-900 Certification
          </ExternalLink>
          . You can customize your experience by selecting your preferred language and difficulty level.
        </p>
        <p className="leading-normal text-muted-foreground">
          The chatbot will ask you a series of questions to help you prepare for the exam. In easy mode, you will receive infinite hints, while in intermediate mode, you will receive a limited number of hints. In hard mode, you will receive no hints at all. You can ask for clarification on previous questions at any time.
        </p>
        <p className="leading-normal text-muted-foreground">
          This project was created by{' '}
          <ExternalLink href="https://iand.dev">
            GRKdev
          </ExternalLink>
          {' '}to help you study and prepare for the AI-900 exam while also demonstrating the capabilities of the{' '}
          <ExternalLink href="https://sdk.vercel.ai">
            Vercel AI SDK
          </ExternalLink>
          {' '}and{' '}
          <ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components (RSC) streaming
          </ExternalLink>
          .
        </p>
        <p className='font-mono'>
          Enjoy your training and good luck on your exam!
        </p>
      </div>
    </div>
  )
}