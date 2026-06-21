'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthFormProps {
  mode: 'signup' | 'login'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [otp, setOtp] = useState('')
  const [showOtpField, setShowOtpField] = useState(false)
  const [error, setError] = useState('')
  const [otpSentMessage, setOtpSentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Check for error parameters in URL (e.g. redirected from Outlook OAuth error)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const err = new URLSearchParams(window.location.search).get('error')
      if (err) {
        setError(err)
      }
    }
  }, [])

  const handleOutlookLogin = () => {
    window.location.href = '/api/auth/outlook'
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleSendOtp = async (email: string) => {
    setError('')
    setOtpSentMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return false
      }
      setOtpSentMessage('Verification OTP sent successfully! Check your console/email.')
      setCountdown(30)
      return true
    } catch (err) {
      setError('An error occurred while sending OTP. Please try again.')
      console.error('Send OTP error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return
    await handleSendOtp(formData.email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOtpSentMessage('')

    if (mode === 'signup' && !showOtpField) {
      const sent = await handleSendOtp(formData.email)
      if (sent) {
        setShowOtpField(true)
      }
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body =
        mode === 'signup'
          ? { ...formData, otp }
          : { email: formData.email, password: formData.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      if (mode === 'signup') {
        router.push('/login')
      } else {
        const params = new URLSearchParams(window.location.search)
        const redirectUrl = params.get('redirect')
        router.push(redirectUrl || '/home')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto p-6"
    >
      <div className="bg-card rounded-xl border border-border p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Decorative Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

        <h1 className="text-3xl font-bold mb-2 text-center text-foreground mt-2">
          {mode === 'signup' 
            ? (showOtpField ? 'Verify Email' : 'Create Account') 
            : 'Welcome Back'}
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          {mode === 'signup'
            ? (showOtpField 
                ? `Enter the verification code sent to ${formData.email}` 
                : 'Join FoodHub and start ordering delicious food')
            : 'Sign in to your account to continue'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {mode === 'signup' && showOtpField ? (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOtpField(false)}
                      className="text-xs text-primary hover:underline"
                    >
                      Change Details
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-center text-2xl tracking-[0.5em] font-mono transition-all"
                    required
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="fields-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    {mode === 'login' && (
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {otpSentMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-xs"
            >
              {otpSentMessage}
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
            {loading
              ? 'Loading...'
              : mode === 'signup'
                ? (showOtpField ? 'Verify & Register' : 'Send Verification Code')
                : 'Sign In'}
          </motion.button>
        </form>

        {/* Separator and Outlook Login Button */}
        {!showOtpField && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-4 text-xs text-muted-foreground uppercase">
                Or continue with
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                type="button"
                onClick={handleOutlookLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 rounded-lg transition-colors font-semibold text-sm shadow-md cursor-pointer"
              >
                {/* Microsoft Logo */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                  <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                  <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                  <rect x="0" y="11" width="10" height="10" fill="#00a1f1" />
                  <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
                </svg>
                <span>Sign in with Outlook</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 rounded-lg transition-colors font-semibold text-sm shadow-md cursor-pointer"
              >
                {/* Google Logo */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign in with Google</span>
              </motion.button>
            </div>
          </>
        )}

        <p className="text-center text-muted-foreground text-sm mt-6">
          {mode === 'signup' ? 'Already have an account?' : 'Don&apos;t have an account?'}{' '}
          <Link
            href={mode === 'signup' ? '/login' : '/signup'}
            onClick={() => {
              setShowOtpField(false)
              setError('')
              setOtpSentMessage('')
            }}
            className="text-primary hover:underline font-semibold"
          >
            {mode === 'signup' ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

