'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Heart, Clock, Star, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

interface Food {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  rating: number
  reviews: number
  prepTime: number
}

export default function FoodDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [food, setFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const handleAddToCart = () => {
    if (!food) return
    setAddingToCart(true)
    
    try {
      const cartData = localStorage.getItem('foodhub_cart')
      let cart: any[] = []
      if (cartData) {
        cart = JSON.parse(cartData)
      }

      const existingItemIndex = cart.findIndex((item) => item.foodId === food._id)
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity
      } else {
        cart.push({
          foodId: food._id,
          name: food.name,
          price: food.price,
          quantity: quantity,
          image: food.image,
        })
      }

      localStorage.setItem('foodhub_cart', JSON.stringify(cart))
      
      // Dispatch custom event to let navbar update its cart badge instantly
      window.dispatchEvent(new Event('cartUpdated'))
      
      setAddedSuccess(true)
      setTimeout(() => {
        setAddedSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  useEffect(() => {
    const loadFood = async () => {
      try {
        const res = await fetch(`/api/foods/${id}`)
        if (res.ok) {
          const data = await res.json()
          setFood(data)
        }
      } catch (error) {
        console.error('[v0] Error loading food:', error)
      } finally {
        setLoading(false)
      }
    }

    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) {
          const data = await res.json()
          setUserRole(data.accountType || 'Customer')
        }
      } catch {
        // Ignore
      }
    }

    loadFood()
    checkRole()
  }, [id])

  const handleToggleFavorite = async () => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: id }),
      })
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('[v0] Toggle favorite error:', error)
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

  if (!food) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-muted-foreground">Food not found</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Image */}
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden border border-border">
              <Image
                src={food.image}
                alt={food.name}
                fill
                className="object-cover"
              />
              {userRole !== 'Admin' && (
                <button
                  onClick={handleToggleFavorite}
                  className="absolute top-4 right-4 p-3 bg-card hover:bg-primary rounded-full shadow-lg transition-all"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                  {food.category}
                </span>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {food.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {food.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-foreground">
                      {food.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({food.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{food.prepTime} minutes</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary">
                    ${food.price}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              {userRole !== 'Admin' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-secondary p-3 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-background hover:bg-muted rounded-lg transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl font-semibold flex-1 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-background hover:bg-muted rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart || addedSuccess}
                    className={`w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-75 disabled:pointer-events-none cursor-pointer ${
                      addedSuccess 
                        ? 'bg-green-600 hover:bg-green-600 text-white' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <span>✓ Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
