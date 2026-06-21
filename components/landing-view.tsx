'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Zap, Heart, Users, Trophy, Mail, Phone, Send, Check, Loader2 } from 'lucide-react'

export function LandingView({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated)
  const [userRole, setUserRole] = useState<string | null>(null)

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setSubmitStatus('success')
    } catch (err: any) {
      setSubmitStatus('error')
      setErrorMessage(err.message || 'Failed to submit the form.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } },
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Hero Text */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight"
              >
                Delicious Food,{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Delivered Fast
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
              >
                Order from your favorite restaurants and get your meals delivered
                to your door in minutes. Enjoy great food without leaving home.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/home"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all font-bold text-lg shadow-lg shadow-primary/20 w-full"
                  >
                    Start Ordering
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/#about"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-xl hover:bg-primary/5 transition-all font-bold text-lg w-full"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Hero Interactive Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative flex items-center justify-center"
            >
              {/* Decorative Background Blob */}
              <div className="absolute w-72 h-72 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-3xl opacity-60" />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10 w-full max-w-sm h-80 rounded-3xl overflow-hidden bg-card/60 border border-border/80 flex items-center justify-center shadow-2xl backdrop-blur-md"
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="text-8xl select-none animate-bounce">🍔</span>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">FoodHub Delivery</div>
                    <div className="text-sm text-muted-foreground mt-1">Fresh &amp; Hot to your door</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 md:py-36 bg-card border-t border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Why Choose FoodHub?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              We provide the best food delivery experience with amazing features
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast Delivery',
                description: 'Get your food in 30-45 minutes',
                color: 'from-amber-400 to-orange-500',
              },
              {
                icon: Heart,
                title: 'Quality Food',
                description: 'Fresh meals from top restaurants',
                color: 'from-rose-400 to-red-500',
              },
              {
                icon: Users,
                title: 'Best Service',
                description: '24/7 customer support available',
                color: 'from-sky-400 to-blue-500',
              },
              {
                icon: Trophy,
                title: 'Top Rated',
                description: 'Trusted by thousands of users',
                color: 'from-emerald-400 to-green-500',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  className="p-8 bg-background border border-border rounded-2xl text-center hover:border-primary transition-all duration-300 shadow-sm"
                >
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-tr ${feature.color} text-white shadow-md shadow-primary/10`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Regular Customer',
                comment:
                  'FoodHub has been a game-changer for me. Fast, reliable, and delicious!',
              },
              {
                name: 'Mike Chen',
                role: 'Food Lover',
                comment:
                  'The variety is amazing. I love trying new restaurants every week.',
              },
              {
                name: 'Emma Davis',
                role: 'Busy Professional',
                comment:
                  'Perfect for my busy schedule. Great service and quick delivery!',
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="p-8 bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-foreground mb-6 italic leading-relaxed">
                  &quot;{testimonial.comment}&quot;
                </p>
                <p className="font-bold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {testimonial.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-36 bg-card border-t border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How long does delivery take?',
                a: 'Typical delivery time is 30-45 minutes, depending on your location and current order volume.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, digital wallets, and cash on delivery.',
              },
              {
                q: 'Can I track my order?',
                a: 'Yes, you can track your order in real-time from the moment it leaves the restaurant.',
              },
              {
                q: 'What if my order arrives late?',
                a: 'We offer a 100% satisfaction guarantee. If there\'s any issue, contact our support team.',
              },
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group bg-background border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <summary className="flex items-center justify-between font-bold text-foreground list-none">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180 text-primary">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>      {/* Contact Section */}
      {userRole !== 'Admin' && (
        <section id="contact" className="py-24 md:py-36 relative overflow-hidden">
          {/* Background blobs for visual style */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
              >
                Contact Us
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Have a question or need assistance? Reach out to us anytime!
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              {/* Info Column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 flex flex-col justify-between space-y-8"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">
                    Get in Touch
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We are here to help. If you have any inquiries, suggestions, or face any issues with your orders, please don't hesitate to contact us.
                  </p>

                  <div className="space-y-4">
                    {/* Email Card */}
                    <motion.a
                      href="mailto:852tutukumar@gmail.com"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-5 bg-card/60 border border-border/85 rounded-2xl hover:border-primary/50 hover:bg-card transition-all duration-300 shadow-sm backdrop-blur-md group"
                    >
                      <div className="p-3.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Us</p>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                          852tutukumar@gmail.com
                        </p>
                      </div>
                    </motion.a>

                    {/* Phone Card */}
                    <motion.a
                      href="tel:+918249607661"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-5 bg-card/60 border border-border/85 rounded-2xl hover:border-primary/50 hover:bg-card transition-all duration-300 shadow-sm backdrop-blur-md group"
                    >
                      <div className="p-3.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Call Us</p>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                          +91 8249607661
                        </p>
                      </div>
                    </motion.a>
                  </div>
                </div>

                {/* Ready to Order Card */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl">
                  <h4 className="font-bold text-foreground mb-2">Ready to order instead?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse our selection of delicious meals and get them delivered to your doorstep.
                  </p>
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Go to Menu <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Form Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7"
              >
                <div className="bg-card/60 border border-border/80 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-md min-h-[450px] flex flex-col justify-center">
                  {!isAuth ? (
                    <div className="text-center py-10 space-y-6 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground">Sign In to Contact Us</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          Please log in to your account to send a message to our support team.
                        </p>
                      </div>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all font-bold text-base shadow-lg shadow-primary/20 cursor-pointer"
                      >
                        Sign In
                      </Link>
                    </div>
                  ) : submitStatus === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10 space-y-6"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 text-green-500 rounded-full">
                        <Check className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Your message has been sent successfully. We will get back to you at <span className="font-semibold text-foreground">{formData.email}</span> as soon as possible.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSubmitStatus('idle')
                          setFormData({ name: '', email: '', subject: '', message: '' })
                        }}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-colors font-bold text-sm"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
                            Full Name
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
                            Email Address
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact-subject" className="text-sm font-semibold text-foreground">
                          Subject
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="How can we help you?"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
                          Message
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Write your message here..."
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground text-sm resize-none"
                        />
                      </div>

                      {submitStatus === 'error' && (
                        <div className="text-red-500 text-sm font-medium">
                          ⚠️ {errorMessage}
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-colors font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}

                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}
      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                FoodHub
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Order delicious food online and get it delivered fast.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 mt-8">
            <p className="text-center text-muted-foreground">
              © 2024 FoodHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
