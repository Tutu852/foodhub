import { Navbar } from '@/components/navbar'
import { LandingView } from '@/components/landing-view'
import { getCurrentUser } from '@/lib/auth'

export const metadata = {
  title: 'FoodHub - Order Delicious Food Online',
  description: 'Discover and order your favorite meals from the best restaurants.',
}

export default async function Page() {
  const user = await getCurrentUser()
  const isAuthenticated = !!user

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <LandingView isAuthenticated={isAuthenticated} />
    </>
  )
}

