import type { NextPage } from 'next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import 'remixicon/fonts/remixicon.css'

// Top 10 Solana SPL Tokens
const TOP_SPL_TOKENS = [
  'USDC',  // Circle - Stablecoin
  'SOL',   // Native token
  'USDT',  // Tether - Stablecoin
  'BONK',  // Bonk - Meme coin
  'JUP',   // Jupiter - DEX aggregator
  'PYTH',  // Pyth Network - Oracle
  'JTO',   // Jito - Liquid staking
  'WIF',   // Dogwifhat - Meme coin
  'RNDR',  // Render - GPU rendering
  'HNT'    // Helium - IoT network
] as const

const Home: NextPage = () => {
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98])
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors">
      {/* Navbar */}
      <motion.nav 
        style={{ opacity, scale }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6 flex items-center justify-between">
          {/* Logo */}
          <motion.a 
            href="/"
            className="flex items-center gap-3 cursor-pointer z-50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg flex items-center justify-center">
              <i className="ri-flashlight-line text-white text-xl"></i>
            </div>
            <span className="text-xl sm:text-2xl font-bold transition-colors text-[#0B0F19] dark:text-white">
              FluxPay
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Pricing', 'Docs'].map((item, i) => (
              <motion.a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-semibold transition-all relative group cursor-pointer text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 dark:bg-teal-400 transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button 
              onClick={toggleTheme}
              className="p-3 rounded-lg transition-all hover:scale-110 cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`text-xl transition-transform duration-500 ${isDark ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </motion.button>
            
            <Button variant="outline" size="md" href="/login">
              Sign In
            </Button>
            
            <Button variant="primary" size="md" href="/signup">
              Start Building
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:scale-110 cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <i className={`text-lg transition-transform duration-500 ${isDark ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </button>
            <button className="p-2 rounded-lg transition-all cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {/* <i className="text-2xl ri-menu-line"></i> */}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-600/20 dark:bg-purple-600/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-teal-500/20 dark:bg-teal-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              className="col-span-1 lg:col-span-3 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
                Accept Solana SPL<br />Payments
                <span className="block bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
                  In Minutes, Not Months
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Production-ready SPL payment infrastructure for Solana. One API key, instant settlement, zero custody risk. Support for USDC, SOL, USDT, BONK, JUP, PYTH, JTO, WIF, RNDR, HNT and more.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-12">
                <motion.a
                  href="/signup"
                  className="group relative w-full sm:w-auto px-12 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform whitespace-nowrap cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Building
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-black/20 rounded-full flex items-center justify-center">
                    <i className="ri-arrow-right-line text-white text-xs sm:text-sm"></i>
                  </span>
                </motion.a>
                
                {/* <motion.button 
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all whitespace-nowrap cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="ri-play-circle-line text-lg sm:text-xl"></i>
                  View Live Demo
                </motion.button> */}
              </div>

              {/* Trusted By */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Trusted by
                </span>
                <div className="flex items-center gap-4 sm:gap-6">
                  {['Phantom', 'Solflare', 'Jupiter'].map((brand, i) => (
                    <motion.span 
                      key={brand}
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white opacity-50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      {brand}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Card - Live Transaction */}
            <motion.div 
              className="col-span-1 lg:col-span-2 mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-500/20 dark:shadow-teal-500/10"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="inline-block px-3 sm:px-4 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                    LIVE TRANSACTION
                  </div>
                  
                  <div className="bg-gray-900 dark:bg-black rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 font-mono text-xs sm:text-sm overflow-x-auto">
                    <div className="text-purple-400">POST /v1/payments</div>
                    <div className="text-gray-500 mt-2">{'{'}</div>
                    <div className="text-teal-400 ml-4">"token": "USDC",      // or SOL, BONK, JUP</div>
                    <div className="text-teal-400 ml-4">"amount": "100",</div>
                    <div className="text-teal-400 ml-4">"status": "confirmed",</div>
                    <div className="text-teal-400 ml-4">"txHash": "5x7k...9fPz",</div>
                    <div className="text-gray-500">{'}'}</div>
                  </div>

                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <motion.div 
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <i className="ri-check-line text-xl sm:text-2xl"></i>
                    </motion.div>
                    <span className="font-semibold text-base sm:text-lg">SPL Payment Confirmed</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="api" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <motion.div 
            className="flex flex-col lg:flex-row items-start justify-between mb-8 sm:mb-12 gap-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="text-teal-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">
                DEVELOPER FIRST
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Integrate in 5 Minutes<br />With One SPL API Call
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md lg:text-right">
              Simple, powerful API for all SPL tokens. Get started with a single endpoint and scale to millions.
            </p>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Language Tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
              {['cURL', 'JavaScript', 'Python'].map((lang, i) => (
                <motion.button
                  key={lang}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    lang === 'JavaScript' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {lang}
                </motion.button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative bg-gray-900 dark:bg-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800 dark:border-gray-700">
              <motion.button 
                className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="ri-file-copy-line"></i>
                Copy
              </motion.button>
              
              <pre className="text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto">
                <code>{`// Accept any of the top 10 SPL tokens
const response = await fetch('https://api.fluxpay.io/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'USDC',      // SOL, USDT, BONK, JUP, PYTH, JTO, WIF, RNDR, HNT
    amount: '100',
    recipient: 'YOUR_SOLANA_WALLET'
  })
});

// Payment settles in <1 second ✨`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 - Instant Settlement */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-teal-500/10 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-teal-100 dark:bg-teal-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <i className="ri-flashlight-line text-2xl sm:text-3xl text-teal-600 dark:text-teal-400"></i>
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Instant SPL Settlement</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                Receive USDC, SOL, or any SPL token directly in seconds. No waiting, no intermediaries, no custody risk.
              </p>
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-semibold">
                Sub-second Finality
              </span>
            </motion.div>

            {/* Feature 2 - Non-Custodial */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-purple-500/10 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <i className="ri-shield-check-line text-2xl sm:text-3xl text-white"></i>
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Non-Custodial</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                Your keys, your SPL tokens. We never hold your funds. Payments go directly from customer to your wallet.
              </p>
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs sm:text-sm font-semibold">
                Zero Custody Risk
              </span>
            </motion.div>

            {/* Feature 3 - Multi-Token */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-teal-500/10 transition-all cursor-pointer sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <i className="ri-coins-line text-2xl sm:text-3xl text-white"></i>
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Multi-SPL Token</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                Accept all top Solana SPL tokens. Let customers pay with their preferred currency.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {TOP_SPL_TOKENS.slice(0, 6).map((token, i) => (
                  <motion.span 
                    key={token}
                    className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {token}
                  </motion.span>
                ))}
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">+4 more</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ 
          backgroundImage: 'linear-gradient(#0B0F19 1px, transparent 1px), linear-gradient(90deg, #0B0F19 1px, transparent 1px)', 
          backgroundSize: '50px 50px' 
        }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-teal-500 dark:text-teal-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">
              TRANSPARENT PRICING
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Pay As You Grow
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              No hidden fees. Support for all top 10 SPL tokens.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Starter Plan */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-400 transition-all"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold mb-6 sm:mb-8">
                Free Forever
              </span>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 mb-6 sm:mb-8"></div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">USDC, SOL, USDT support</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Up to $10K monthly volume</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">1% transaction fee</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Basic API access</span>
                </li>
              </ul>
              <Button variant="outline" size="lg" href="/signup" className="w-full">
                Get Started
              </Button>
            </motion.div>

            {/* Pro Plan - Most Popular */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 border-2 border-transparent relative -mt-0 md:-mt-4 shadow-xl dark:shadow-purple-500/10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute -top-3 sm:-top-4 right-6 sm:right-8 px-3 sm:px-4 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">$49</span>
                <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 mb-6 sm:mb-8"></div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    All top 10 SPL tokens: {TOP_SPL_TOKENS.join(', ')}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Up to $500K monthly volume</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">0.5% transaction fee</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Full API + Webhooks</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Priority support</span>
                </li>
              </ul>
              <Button variant="primary" size="lg" href="/signup" className="w-full">
                Start Free Trial
              </Button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-400 transition-all"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">Custom</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 mb-6 sm:mb-8"></div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">All SPL tokens + custom tokens</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Unlimited volume</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom fee structure</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">SLA guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-lg sm:text-xl text-teal-500 dark:text-teal-400 mt-0.5"></i>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom integrations</span>
                </li>
              </ul>
              <Button variant="outline" size="lg" href="/contact" className="w-full">
                Contact Sales
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative overflow-hidden bg-white dark:bg-[#0B0F19] py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1.5 bg-teal-500/10 dark:bg-teal-500/10 border border-teal-500/20 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-widest mb-5">
              Built on Solana
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-5">
              Ready to Accept<br />
              <span className="bg-gradient-to-r from-teal-600 dark:from-teal-400 to-purple-600 dark:to-purple-400 bg-clip-text text-transparent">
                SPL Payments?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Join thousands of merchants already processing millions in Solana SPL payments — with zero custody risk and instant settlement.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-6 mb-16 sm:mb-20 perspective-1000">
            {/* Card 1 - Instant Settlement */}
            <motion.div 
              className="group w-full max-w-sm lg:max-w-xs xl:max-w-sm flex-shrink-0"
              style={{ perspective: '1000px' }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative w-full rounded-2xl p-px bg-gradient-to-br from-teal-400/40 via-transparent to-purple-500/40 shadow-2xl shadow-teal-500/20">
                <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#0d1220] rounded-2xl p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-teal-500/20 rounded-full">
                        <i className="ri-exchange-dollar-line text-teal-600 dark:text-teal-400 text-base"></i>
                      </div>
                      <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide">FluxPay</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">● LIVE</span>
                  </div>
                  <div className="mb-5">
                    <p className="text-gray-600 dark:text-gray-500 text-xs mb-1 uppercase tracking-wider">SPL Payment Received</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$2,450.00</p>
                    <p className="text-teal-600 dark:text-teal-400 text-sm font-medium mt-1">2,450 USDC · Solana</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-black/30 rounded-xl p-3 mb-5 font-mono">
                    <p className="text-gray-600 dark:text-gray-500 text-xs mb-1">Transaction Hash</p>
                    <p className="text-gray-800 dark:text-gray-300 text-xs truncate">5x7kQm...9fPzR2</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold whitespace-nowrap">Confirmed</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center px-2">
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">Instant USDC Settlement</p>
                <p className="text-gray-600 dark:text-gray-500 text-xs sm:text-sm mt-1">Funds hit your wallet in &lt;1 second. No banks. No delays.</p>
              </div>
            </motion.div>

            {/* Card 2 - Multi-Token (Most Popular) */}
            <motion.div 
              className="group w-full max-w-sm lg:max-w-xs xl:max-w-sm flex-shrink-0 lg:-mt-8"
              style={{ perspective: '1000px' }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative w-full rounded-2xl p-px bg-gradient-to-br from-purple-500/50 via-teal-400/30 to-purple-500/50 shadow-2xl shadow-purple-500/25">
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-xs font-bold rounded-b-xl tracking-wider uppercase">Most Popular</div>
                </div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-[#12101e] dark:to-[#0d1220] rounded-2xl p-6 sm:p-7 overflow-hidden pt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-teal-500/8 pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full">
                        <i className="ri-coins-line text-purple-600 dark:text-purple-400 text-base"></i>
                      </div>
                      <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide">Multi-SPL</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded text-xs font-mono">SOL</span>
                      <span className="px-2 py-0.5 bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded text-xs font-mono">USDC</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-mono w-10">USDC</span>
                      <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-gray-800 dark:text-gray-300 text-xs font-semibold w-14 text-right">$1,875</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-mono w-10">SOL</span>
                      <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                      <span className="text-gray-800 dark:text-gray-300 text-xs font-semibold w-14 text-right">$850</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-mono w-10">BONK</span>
                      <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-gray-800 dark:text-gray-300 text-xs font-semibold w-14 text-right">$210</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-mono w-10">JUP</span>
                      <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-gray-800 dark:text-gray-300 text-xs font-semibold w-14 text-right">$150</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 dark:border-white/5 pt-4 flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-500 text-xs">Total Volume Today</span>
                    <span className="text-gray-900 dark:text-white font-bold text-sm">$3,085.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center px-2">
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">Accept Any SPL Token</p>
                <p className="text-gray-600 dark:text-gray-500 text-xs sm:text-sm mt-1">USDC, SOL, BONK, JUP & 6+ more. One integration.</p>
              </div>
            </motion.div>

            {/* Card 3 - API Ready */}
            <motion.div 
              className="group w-full max-w-sm lg:max-w-xs xl:max-w-sm flex-shrink-0"
              style={{ perspective: '1000px' }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative w-full rounded-2xl p-px bg-gradient-to-br from-emerald-400/30 via-transparent to-teal-500/40 shadow-2xl shadow-emerald-500/15">
                <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#0d1220] rounded-2xl p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 rounded-full">
                        <i className="ri-key-2-line text-emerald-600 dark:text-emerald-400 text-base"></i>
                      </div>
                      <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide">API Ready</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">Active</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-black/40 rounded-xl p-4 mb-5 font-mono">
                    <p className="text-gray-600 dark:text-gray-500 text-xs mb-2">Quick Integration</p>
                    <p className="text-teal-600 dark:text-teal-400 text-xs leading-relaxed">
                      <span className="text-purple-600 dark:text-purple-400">POST</span> /v1/payments<br />
                      <span className="text-gray-600 dark:text-gray-500">Authorization:</span> <span className="text-emerald-600 dark:text-emerald-400">Bearer sk_live_...</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-200 dark:bg-black/20 rounded-xl p-3 text-center">
                      <p className="text-gray-900 dark:text-white font-bold text-lg">99.9%</p>
                      <p className="text-gray-600 dark:text-gray-500 text-xs mt-0.5">Uptime SLA</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-black/20 rounded-xl p-3 text-center">
                      <p className="text-gray-900 dark:text-white font-bold text-lg">&lt;400ms</p>
                      <p className="text-gray-600 dark:text-gray-500 text-xs mt-0.5">Avg Response</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <i className="ri-shield-check-line text-base"></i>
                    <span className="text-xs font-semibold">Non-custodial · Your keys, your funds</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center px-2">
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">One API. All SPL Tokens.</p>
                <p className="text-gray-600 dark:text-gray-500 text-xs sm:text-sm mt-1">Go live in 5 minutes. Built for developers who ship fast.</p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-purple-500 rounded-xl text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-teal-500/20 whitespace-nowrap cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Building Free
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-right-line text-white text-sm"></i>
              </span>
            </motion.a>
            <motion.a
              href="/docs"
              className="w-full sm:w-auto px-8 py-4 border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-900 dark:text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-code-s-slash-line text-teal-500 dark:text-teal-400"></i>
              Read the Docs
            </motion.a>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-600 text-xs sm:text-sm mt-6">
            No credit card required · Free tier available · Support for all top 10 SPL tokens
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0B0F19] rounded-t-3xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-12 md:mb-16">
            {/* Newsletter */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">Stay Updated</h3>
              <p className="text-gray-600 dark:text-gray-500 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Get the latest updates on new SPL tokens, features, and Solana payment trends.
              </p>
              <div className="space-y-4">
                <input 
                  placeholder="Enter your email" 
                  className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-3 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors text-sm sm:text-base" 
                  type="email" 
                />
                <button className="px-6 sm:px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap cursor-pointer text-sm sm:text-base">
                  Subscribe
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            </div>

            {/* Supported Tokens */}
            <div>
              <h4 className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
                SUPPORTED TOKENS
              </h4>
              <div className="flex flex-wrap gap-2">
                {TOP_SPL_TOKENS.map(token => (
                  <span key={token} className="px-2 py-1 bg-gray-200 dark:bg-gray-800/50 rounded text-xs text-gray-800 dark:text-gray-300 font-mono">
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
                PRODUCT
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                {['Features', 'Pricing', 'API Docs', 'Status'].map(item => (
                  <li key={item}>
                    <a href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer text-sm sm:text-base">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
                COMMUNITY
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <a href="#" className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <i className="ri-twitter-x-line text-lg sm:text-xl"></i>
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <i className="ri-discord-line text-lg sm:text-xl"></i>
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <i className="ri-github-line text-lg sm:text-xl"></i>
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 order-2 sm:order-1">
              <a href="#" className="text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <i className="ri-twitter-x-line text-xl sm:text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <i className="ri-discord-line text-xl sm:text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <i className="ri-github-line text-xl sm:text-2xl"></i>
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-500 text-xs sm:text-sm order-1 sm:order-2">
              © 2025 FluxPay. Built on Solana. Supporting all top 10 SPL tokens.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 order-3">
              <a href="#" className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-xs sm:text-sm cursor-pointer">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-xs sm:text-sm cursor-pointer">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home