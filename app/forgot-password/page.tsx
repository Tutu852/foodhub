'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to request password reset')
        return
      }

      setSuccess(data.message || 'Password reset link sent successfully! Check your console/email.')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Forgot password UI error:', err)
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
            Reset Password
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
