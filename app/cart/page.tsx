'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, Minus, Plus, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CartItem {
  foodId: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) {
          setIsAuth(true)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()

    // Load cart items
    const loadCart = () => {
      try {
        const data = localStorage.getItem('foodhub_cart')
        if (data) {
          setCartItems(JSON.parse(data))
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    loadCart()
  }, [])

  const saveCart = (items: CartItem[]) => {
    setCartItems(items)
    try {
      localStorage.setItem('foodhub_cart', JSON.stringify(items))
      // Trigger event to sync navbar badge
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  const handleUpdateQuantity = (foodId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.foodId === foodId) {
          const newQty = item.quantity + delta
          return { ...item, quantity: Math.max(1, newQty) }
        }
        return item
      })
    saveCart(updated)
  }

  const handleRemoveItem = (foodId: string) => {
    const updated = cartItems.filter((item) => item.foodId !== foodId)
    saveCart(updated)
  }

  const handleProceedToPayment = () => {
    if (isAuth) {
      router.push('/payment')
    } else {
      router.push('/login?redirect=/payment')
    }
  }

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal > 0 ? 3.00 : 0
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-muted-foreground animate-pulse">Loading cart...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-10"
          >
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Shopping Cart</h1>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-card/40 border border-border/80 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Your cart is empty</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Browse our selection of delicious meals and add items to your cart.
                </p>
              </div>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20"
              >
                <ArrowLeft className="w-4 h-4" /> Browse Foods
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.foodId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card/60 border border-border/80 rounded-2xl backdrop-blur-md hover:border-primary/30 transition-all duration-300 shadow-sm"
                    >
                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl border border-border flex-shrink-0"
                      />

                      {/* Detail */}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                        <p className="text-primary font-bold mt-1 text-base">${item.price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 bg-background/50 border border-border px-3 py-1.5 rounded-xl">
                        <button
                          onClick={() => handleUpdateQuantity(item.foodId, -1)}
                          className="p-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.foodId, 1)}
                          className="p-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="w-24 text-center sm:text-right font-bold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.foodId)}
                        className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-card/60 border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6"
              >
                <h3 className="text-xl font-bold text-foreground">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-foreground">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-border pt-3 mt-3 flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToPayment}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <Link
                  href="/home"
                  className="block text-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </motion.div>

            </div>
          )}
        </div>
      </main>
    </>
  )
}
