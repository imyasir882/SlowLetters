import { Suspense } from 'react'
import AuthWrapper from '@/components/AuthWrapper'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-vintage-paper">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="elegant-serif text-6xl font-bold text-vintage-sepia mb-4">
            SlowLetters
          </h1>
          <p className="text-vintage-faded text-lg max-w-2xl mx-auto">
            Romance in every word. A place where two hearts share one story, 
            one letter at a time.
          </p>
        </header>

        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading-dots text-vintage-gold text-xl">
              Loading your love letters
            </div>
          </div>
        }>
          <AuthWrapper />
        </Suspense>
      </div>
    </main>
  )
}
