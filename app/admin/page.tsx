'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { 
  DollarSign, 
  ShoppingBag, 
  Utensils, 
  Clock, 
  TrendingUp, 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  Activity,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface OrderItem {
  foodId: string
  foodName: string
  quantity: number
  price: number
  image: string
}

interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  deliveryAddress: string
  createdAt: string
}

interface FoodItem {
  _id: string
  name: string
  category: string
  price: number
  preparationTime: number
  inStock: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')

  // Load Admin profile and verify authority
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const authRes = await fetch('/api/auth/profile')
        if (!authRes.ok) {
          router.push('/login')
          return
        }
        const authData = await authRes.json()
        if (authData.accountType !== 'Admin') {
          router.push('/')
          return
        }

        // Fetch Orders and Foods
        const [ordersRes, foodsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/foods')
        ])

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setOrders(ordersData)
        }
        if (foodsRes.ok) {
          const foodsData = await foodsRes.json()
          setFoods(foodsData)
        }

        setLoading(false)
      } catch (error) {
        console.error('[Admin] Error loading admin dashboard:', error)
        router.push('/login')
      }
    }
    initDashboard()
  }, [router])

  // Handle order status update
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (res.ok) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus as any } : order
          )
        )
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error || 'Failed to update order status'}`)
      }
    } catch (error) {
      console.error('[Admin] Status update error:', error)
      alert('An error occurred while updating status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Calculate stats
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalPrice, 0)

  const pendingCount = orders.filter(order => order.status === 'pending').length
  const activeOrdersCount = orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.foodName.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  // Format Date utility
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="flex flex-col justify-center items-center min-h-[80vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div className="text-lg text-muted-foreground animate-pulse font-medium">
            Loading Admin Dashboard...
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <main className="min-h-screen bg-background pb-20">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-card/40 border-b border-border py-12 mb-8 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Activity className="text-primary w-8 h-8" />
                Admin Console
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Manage your shop, track sales performance, and process delivery orders
              </p>
            </div>
            <button
              onClick={() => router.push('/add-item')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Food Item
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Analytics Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            
            {/* Revenue */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-card/50 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales</span>
                <h3 className="text-3xl font-black text-foreground">${totalRevenue.toFixed(2)}</h3>
                <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Live Earnings
                </span>
              </div>
              <div className="p-4 bg-primary/10 text-primary rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Total Orders */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-card/50 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                <h3 className="text-3xl font-black text-foreground">{orders.length}</h3>
                <span className="text-xs text-muted-foreground font-medium">All-time count</span>
              </div>
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Active Orders */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-card/50 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Orders</span>
                <h3 className="text-3xl font-black text-foreground">{activeOrdersCount}</h3>
                <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pendingCount} Pending
                </span>
              </div>
              <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </motion.div>

            {/* Total Dishes */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-card/50 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Menu</span>
                <h3 className="text-3xl font-black text-foreground">{foods.length}</h3>
                <span className="text-xs text-muted-foreground font-medium">Dishes listed</span>
              </div>
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl">
                <Utensils className="w-6 h-6" />
              </div>
            </motion.div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/80 gap-6 mb-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 text-lg font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`pb-4 px-2 text-lg font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Menu Items ({foods.length})
            </button>
          </div>

          {/* Orders Management View */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/45 border border-border/80 p-4 rounded-2xl backdrop-blur-sm">
                
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, dish, or address..."
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground"
                  />
                </div>

                {/* Filter status */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-40 px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

              </div>

              {/* Orders Table */}
              <div className="bg-card/50 border border-border/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground text-xs font-extrabold uppercase">
                        <th className="py-4 px-6">Order ID</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Dishes / Quantity</th>
                        <th className="py-4 px-6">Delivery Address</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm text-foreground">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-muted/10 transition-colors">
                            
                            {/* Order ID */}
                            <td className="py-4 px-6 font-mono text-xs font-bold text-primary">
                              #{order._id.substring(order._id.length - 8).toUpperCase()}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-6 whitespace-nowrap text-xs text-muted-foreground font-medium">
                              {formatDate(order.createdAt)}
                            </td>

                            {/* Items */}
                            <td className="py-4 px-6 max-w-xs">
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between gap-4">
                                    <span className="font-semibold text-foreground truncate">{item.foodName}</span>
                                    <span className="text-muted-foreground whitespace-nowrap">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Address */}
                            <td className="py-4 px-6 font-medium max-w-xs truncate" title={order.deliveryAddress}>
                              {order.deliveryAddress}
                            </td>

                            {/* Price */}
                            <td className="py-4 px-6 font-extrabold text-foreground whitespace-nowrap">
                              ${order.totalPrice.toFixed(2)}
                            </td>

                            {/* Status and Action */}
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-3">
                                {updatingOrderId === order._id ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                ) : (
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`px-3 py-1.5 border rounded-lg text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                                      order.status === 'delivered' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                      order.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                      order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 animate-pulse' :
                                      'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                    }`}
                                  >
                                    <option value="pending" className="bg-background text-foreground">Pending</option>
                                    <option value="confirmed" className="bg-background text-foreground">Confirmed</option>
                                    <option value="preparing" className="bg-background text-foreground">Preparing</option>
                                    <option value="ready" className="bg-background text-foreground">Ready</option>
                                    <option value="delivered" className="bg-background text-foreground">Delivered</option>
                                    <option value="cancelled" className="bg-background text-foreground">Cancelled</option>
                                  </select>
                                )}
                              </div>
                            </td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
                              <span className="font-semibold text-base">No orders found</span>
                              <span className="text-xs">Adjust your search term or status filter</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Menu Management View */}
          {activeTab === 'menu' && (
            <div className="bg-card/50 border border-border/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground text-xs font-extrabold uppercase">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6 text-center">Prep Time</th>
                      <th className="py-4 px-6 text-center">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm text-foreground">
                    {foods.length > 0 ? (
                      foods.map((food) => (
                        <tr key={food._id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-4 px-6 font-semibold">{food.name}</td>
                          <td className="py-4 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                            {food.category}
                          </td>
                          <td className="py-4 px-6 font-extrabold">${food.price.toFixed(2)}</td>
                          <td className="py-4 px-6 text-center font-medium">{food.preparationTime} mins</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              food.inStock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {food.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Utensils className="w-8 h-8 text-muted-foreground/60" />
                            <span className="font-semibold text-base">No menu items found</span>
                            <span className="text-xs">Add your first food item using the button above</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
