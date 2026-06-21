'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { PlusCircle, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface FoodForm {
  name: string
  description: string
  price: string
  category: string
  image: string
  preparationTime: string
}

const PRESET_IMAGES = [
  {
    name: 'Classic Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    category: 'Pizza',
  },
  {
    name: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    category: 'Burgers',
  },
  {
    name: 'Fresh Salad',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
    category: 'Salads',
  },
  {
    name: 'Chocolate Cake',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    category: 'Desserts',
  },
]

export default function AddItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState<FoodForm>({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    image: '',
    preparationTime: '15',
  })

  // Protect client route
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (!res.ok) {
          router.push('/login')
          return
        }
        setLoading(false)
      } catch (error) {
        console.error('[v0] Auth verification error:', error)
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    // Validate fields
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.image || !formData.preparationTime) {
      setErrorMessage('All fields are required.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          image: formData.image,
          preparationTime: Number(formData.preparationTime),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add food item. Please try again.')
      }

      setSuccessMessage('Food item added successfully!')
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-muted-foreground animate-pulse">Checking authorization...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/60 border border-border/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Add New Food</h1>
                <p className="text-muted-foreground mt-0.5">List a new dish on the FoodHub menu</p>
              </div>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-sm font-semibold">
                ✓ {successMessage} Redirecting...
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="food-name" className="text-sm font-semibold text-foreground">
                    Food Name
                  </label>
                  <input
                    id="food-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pepperoni Pizza"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="food-category" className="text-sm font-semibold text-foreground">
                    Category
                  </label>
                  <select
                    id="food-category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                  >
                    <option value="Pizza">Pizza</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Salads">Salads</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="food-price" className="text-sm font-semibold text-foreground">
                    Price ($)
                  </label>
                  <input
                    id="food-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="9.99"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                  />
                </div>

                {/* Preparation Time */}
                <div className="space-y-2">
                  <label htmlFor="food-preptime" className="text-sm font-semibold text-foreground">
                    Prep Time (minutes)
                  </label>
                  <input
                    id="food-preptime"
                    type="number"
                    min="1"
                    required
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    placeholder="15"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="food-desc" className="text-sm font-semibold text-foreground">
                  Description
                </label>
                <textarea
                  id="food-desc"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a delicious description of the item..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm resize-none"
                />
              </div>

              {/* Image URL with Preset Picker */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="food-image" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    Image URL
                  </label>
                  <input
                    id="food-image"
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                  />
                </div>

                {/* Preset suggestions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Or select a quick suggestions image:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: img.url, category: img.category })}
                        className={`p-2 border rounded-xl bg-background/50 hover:border-primary/50 text-left transition-all cursor-pointer flex flex-col items-center gap-2 group ${
                          formData.image === img.url ? 'border-primary ring-1 ring-primary' : 'border-border'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                        />
                        <span className="text-[10px] font-bold text-center text-foreground">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-colors font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:pointer-events-none cursor-pointer mt-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding Food Item...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Add Food Item
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>
    </>
  )
}
