import { motion } from 'framer-motion'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  href,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-teal-500 text-white hover:shadow-lg',
    secondary: 'bg-navy text-white hover:bg-navy/80',
    outline: 'border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-white/5'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const content = isLoading ? (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  ) : children

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.a
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {content}
    </motion.a>
  )
})

Button.displayName = 'Button'

export default Button