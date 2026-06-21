import { AuthForm } from '@/components/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - FoodHub',
  description: 'Create a new FoodHub account',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <AuthForm mode="signup" />
    </div>
  )
}
