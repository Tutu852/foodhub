'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { CreditCard, MapPin, CheckCircle, ArrowLeft, Loader2, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CartItem {
  foodId: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Form states
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  // Check auth and load cart
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (!res.ok) {
          router.push('/login?redirect=/payment')
          return
        }
        
        // Load cart
        const cartData = localStorage.getItem('foodhub_cart')
        if (cartData) {
          const parsed = JSON.parse(cartData)
          if (parsed.length === 0) {
            router.push('/cart')
            return
          }
          setCartItems(parsed)
        } else {
          router.push('/cart')
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push('/login?redirect=/payment')
      }
    }
    checkAuth()
  }, [router])

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 3.00
  const tax = subtotal * 0.05
  const total = subtotal + deliveryFee + tax

  // Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16)
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
    const formatted = value.replace(/(\d{2})(?=\d)/g, '$1/')
    setCardExpiry(formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3)
    setCardCvv(value)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    if (!deliveryAddress || deliveryAddress.length < 5) {
      setErrorMessage('Please enter a valid delivery address (minimum 5 characters).')
      setIsSubmitting(false)
      return
    }

    try {
      // Create order in backend database using existing api endpoint
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalPrice: total,
          deliveryAddress: deliveryAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed. Please verify details.')
      }

      // Success sequence
      setPaymentSuccess(true)
      
      // Clear cart
      localStorage.removeItem('foodhub_cart')
      window.dispatchEvent(new Event('cartUpdated'))

      // Redirect after animations
      setTimeout(() => {
        router.push('/orders')
      }, 2500)
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-muted-foreground animate-pulse">Initializing payment gateway...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back to Cart */}
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>

          {paymentSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-20 bg-card/60 border border-border/80 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 text-green-500 rounded-full">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-foreground">Payment Successful!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Your order has been recorded successfully. Redirecting you to your orders page...
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Payment Details Column */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Credit Card Graphic Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md mx-auto aspect-[1.586/1] bg-gradient-to-tr from-primary to-accent rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold tracking-widest font-mono">FOODHUB CARD</span>
                    <span className="text-lg font-black italic tracking-widest">VISA</span>
                  </div>
                  <div className="w-12 h-10 bg-yellow-500/80 rounded-lg flex-shrink-0" />
                  <div>
                    <div className="text-xl font-bold font-mono tracking-[0.2em] mb-4">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <div>
                        <span className="block opacity-60 text-[9px] uppercase">Cardholder</span>
                        <span className="font-bold tracking-wider">{cardName.toUpperCase() || 'YOUR NAME'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block opacity-60 text-[9px] uppercase">Expires</span>
                        <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Billing Info Form */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card/60 border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
                >
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Details
                  </h3>

                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-semibold">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Cardholder Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                      />
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono"
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">CVV</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono text-center"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground pt-4 mb-4 border-t border-border flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Information
                    </h3>

                    {/* Delivery Address */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Delivery Address</label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="123 Main Street, Apt 4B, New York, NY"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Delivery Notes (Optional)</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g. Leave by the front door, ring doorbell"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:pointer-events-none cursor-pointer mt-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5" />
                          Pay ${total.toFixed(2)}
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </div>

              {/* Items Summary Column */}
              <div className="lg:col-span-5 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card/60 border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6"
                >
                  <h3 className="text-xl font-bold text-foreground">Review Order</h3>
                  <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.foodId} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-border"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground leading-tight">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-sm text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Tax (5%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-border pt-3 mt-3 flex justify-between text-base font-bold text-foreground">
                      <span>Total Amount</span>
                      <span className="text-primary text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          )}
        </div>
      </main>
    </>
  )
}
