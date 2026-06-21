'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ResetPasswordProps {
  params: Promise<{
    token: string
  }>
}

export default function ResetPasswordPage({ params }: ResetPasswordProps) {
  const { token } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)
    return () => clearTimeout(timer)
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      setSuccess('Password reset successful! Redirecting to login page...')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Reset password UI error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-card rounded-xl border border-border p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Decorative Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

          <h1 className="text-3xl font-bold mb-2 text-center text-foreground mt-2">
            New Password
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            Please choose a secure password that is at least 6 characters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                required
              />
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-xs"
              >
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive/10 border border-destructive text-destructive px-4 py-2.5 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !!success}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold flex items-center justify-center gap-1.5"
            >
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
