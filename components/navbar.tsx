'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'

interface NavbarProps {
  isAuthenticated?: boolean
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuth, setIsAuth] = useState(isAuthenticated)
  const [cartCount, setCartCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    const updateCartCount = () => {
      try {
        const cartData = localStorage.getItem('foodhub_cart')
        if (cartData) {
          const cart = JSON.parse(cartData)
          const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(totalItems)
        } else {
          setCartCount(0)
        }
      } catch {
        setCartCount(0)
      }
    }

    updateCartCount()
    
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) {
          const data = await res.json()
          setIsAuth(true)
          setUserRole(data.accountType || 'Customer')
        } else {
          setIsAuth(false)
          setUserRole(null)
        }
      } catch {
        setIsAuth(false)
        setUserRole(null)
      }
    }
    checkAuth()
  }, [isAuthenticated])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={isAuth ? "/" : "/"}
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
              F
            </div>
            FoodHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/#faq"
              className="text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            {isAuth && userRole === 'Admin' && (
              <>
                <Link
                  href="/admin"
                  className="text-foreground hover:text-primary transition-colors font-semibold"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/add-item"
                  className="text-foreground hover:text-primary transition-colors font-semibold"
                >
                  Add Food
                </Link>
              </>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/cart"
              className="p-2 hover:bg-secondary rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold font-sans">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuth ? (
              <>
                <Link
                  href="/favorites"
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  title="Favorites"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  href="/orders"
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  title="Orders"
                >
                  <span className="text-sm font-semibold">Orders</span>
                </Link>
                <Link
                  href="/profile"
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-full"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden pb-4 space-y-2 px-4 sm:px-6 lg:px-8">
          <Link
            href="/home"
            className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#about"
            className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            About
          </Link>
          <Link
            href="/#contact"
            className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/#faq"
            className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/cart"
            className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors font-medium flex items-center justify-between"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuth ? (
            <>
              {userRole === 'Admin' && (
                <>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors font-semibold text-primary"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    href="/add-item"
                    className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors font-semibold text-primary"
                  >
                    Add Food
                  </Link>
                </>
              )}
              <Link
                href="/favorites"
                className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Favorites
              </Link>
              <Link
                href="/orders"
                className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

