import { AuthForm } from '@/components/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - FoodHub',
  description: 'Sign in to your FoodHub account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <AuthForm mode="login" />
    </div>
  )
}
