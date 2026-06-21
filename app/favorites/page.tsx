'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { FoodCard } from '@/components/food-card'
import { Heart } from 'lucide-react'
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

export default function FavoritesPage() {
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Get favorites
        const favRes = await fetch('/api/favorites')
        if (!favRes.ok) {
          router.push('/login')
          return
        }

        // Redirect admins away from favorites page
        try {
          const profileRes = await fetch('/api/auth/profile')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            if (profileData.accountType === 'Admin') {
              router.push('/admin')
              return
            }
          }
        } catch {
          // Ignore
        }

        const favData = await favRes.json()
        setFavorites(favData.favorites || [])

        // Get all foods and filter
        const foodRes = await fetch('/api/foods')
        const allFoods = await foodRes.json()
        const favFoods = allFoods.filter((f: Food) =>
          favData.favorites?.includes(f._id)
        )
        setFoods(favFoods)
      } catch (error) {
        console.error('[v0] Error loading favorites:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [router])

  const handleToggleFavorite = async (foodId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId }),
      })

      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites)
        setFoods(foods.filter((f) => data.favorites.includes(f._id)))
      }
    } catch (error) {
      console.error('[v0] Toggle favorite error:', error)
    }
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-destructive fill-destructive" />
              <h1 className="text-4xl font-bold text-foreground">My Favorites</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Your saved meals and dishes
            </p>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
          ) : foods.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {foods.map((food, idx) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <FoodCard
                    id={food._id}
                    name={food.name}
                    description={food.description}
                    price={food.price}
                    image={food.image}
                    rating={food.rating}
                    reviews={food.reviews}
                    prepTime={food.prepTime}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground mb-4">
                You haven&apos;t added any favorites yet
              </p>
              <a
                href="/home"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Foods
              </a>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
