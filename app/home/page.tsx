'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { FoodCard } from '@/components/food-card'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function HomePage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const categories = ['all', 'Pizza', 'Burgers', 'Salads', 'Desserts']

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch foods
        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (searchQuery) params.append('search', searchQuery)

        const foodRes = await fetch(`/api/foods?${params}`)
        const foodData = await foodRes.json()
        setFoods(foodData)

        // Fetch favorites
        try {
          const favRes = await fetch('/api/favorites')
          if (favRes.ok) {
            const favData = await favRes.json()
            setFavorites(favData.favorites || [])
          }
        } catch {
          // Not authenticated
        }
      } catch (error) {
        console.error('[v0] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedCategory, searchQuery])

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
      }
    } catch (error) {
      console.error('[v0] Toggle favorite error:', error)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/8 to-accent/8 border-b border-border/40 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Delicious Food Awaits
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                Discover and order your favorite meals from the best restaurants.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3 bg-card border border-border/80 rounded-xl p-3 max-w-md shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
            >
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
              />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Filter */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 overflow-x-auto pb-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Foods Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-lg text-muted-foreground animate-pulse">Loading...</div>
            </div>
          ) : foods.length > 0 ? (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {foods.map((food, idx) => (
                  <motion.div
                    key={food._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
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
                      isFavorite={favorites.includes(food._id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-24"
            >
              <div className="text-lg text-muted-foreground">
                No foods found. Try a different search.
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
