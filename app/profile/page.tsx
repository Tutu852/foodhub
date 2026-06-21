'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { User, Mail, Edit2, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  name: string
  email: string
  favorites: string[]
  orders: string[]
  provider?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setUser(data)
        setFormData({ name: data.name, email: data.email })
      } catch (error) {
        console.error('[v0] Error loading profile:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = () => {
    // In a real app, would make API call to update profile
    if (user) {
      setUser({ ...user, ...formData })
      setIsEditing(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Navbar isAuthenticated={true} />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    My Profile
                  </h1>
                  <p className="text-muted-foreground">Manage your account</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Name
                    </label>
                    <p className="text-lg text-foreground">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <p className="text-lg text-foreground flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        {user.email}
                      </p>
                      {user.provider === 'outlook' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                          {/* Microsoft Logo */}
                          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 21 21">
                            <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                            <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                            <rect x="0" y="11" width="10" height="10" fill="#00a1f1" />
                            <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
                          </svg>
                          Logged in via Outlook
                        </span>
                      )}
                      {user.provider === 'google' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
                          {/* Google Logo */}
                          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24">
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
                          Logged in via Google
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-background p-4 rounded-lg text-center"
              >
                <p className="text-muted-foreground text-sm">Total Favorites</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {user.favorites.length}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-background p-4 rounded-lg text-center"
              >
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {user.orders.length}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
