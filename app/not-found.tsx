import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to ordering delicious food!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Go to Home
            </Link>
            <Link
              href="/home"
              className="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold"
            >
              Browse Foods
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
