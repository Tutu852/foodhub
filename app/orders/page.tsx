'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Clock, MapPin, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface Order {
  _id: string
  items: Array<{
    foodId: string
    quantity: number
    price: number
  }>
  totalPrice: number
  deliveryAddress: string
  status: 'pending' | 'processing' | 'delivered'
  createdAt: string
  updatedAt: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()
        setOrders(data)
      } catch (error) {
        console.error('[v0] Error loading orders:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [router])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">My Orders</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Track your food deliveries
            </p>
          </motion.div>

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm capitalize ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Delivery Address
                        </p>
                        <p className="text-sm text-foreground">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Estimated Time
                        </p>
                        <p className="text-sm text-foreground">30-45 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Total Amount
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground mb-4">
                You haven&apos;t placed any orders yet
              </p>
              <a
                href="/home"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Ordering
              </a>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
