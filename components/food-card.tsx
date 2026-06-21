'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock, Star } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface FoodCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  rating: number
  reviews: number
  prepTime: number
  isFavorite?: boolean
  onToggleFavorite?: (foodId: string) => Promise<void>
  isAdmin?: boolean
}

export function FoodCard({
  id,
  name,
  description,
  price,
  image,
  rating,
  reviews,
  prepTime,
  isFavorite = false,
  onToggleFavorite,
  isAdmin = false,
}: FoodCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!onToggleFavorite || loading) return

    setLoading(true)
    try {
      await onToggleFavorite(id)
      setFavorite(!favorite)
    } catch (error) {
      console.error('[v0] Toggle favorite error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      className="h-full"
    >
      <Link href={`/food/${id}`}>
        <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-secondary">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {!isAdmin && onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              disabled={loading}
              className="absolute top-3 right-3 p-2 bg-card hover:bg-primary rounded-full shadow-lg transition-all duration-200 group-hover:scale-110"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                }`}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Rating and Time */}
          <div className="flex items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{rating}</span>
              <span className="text-muted-foreground">({reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{prepTime} min</span>
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">${price}</span>
            {!isAdmin && (
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm">
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  )
}
