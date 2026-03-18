import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import 'remixicon/fonts/remixicon.css'

export default function Navbar() {
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
        <Link href="/" className="flex items-center gap-3 cursor-pointer z-50">
          <motion.div 
            className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <i className="ri-flashlight-line text-white text-xl"></i>
          </motion.div>
          <span className="text-xl sm:text-2xl font-bold transition-colors text-[#0B0F19] dark:text-white">
            FluxPay
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {['Home', 'Pricing', 'Docs'].map((item, i) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="font-semibold transition-all relative group cursor-pointer text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 dark:bg-teal-400 transition-all group-hover:w-full" />
            </Link>
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
            <i className="text-2xl ri-menu-line"></i>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}