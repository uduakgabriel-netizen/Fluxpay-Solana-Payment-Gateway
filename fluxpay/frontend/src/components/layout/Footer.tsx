import Link from 'next/link'
import 'remixicon/fonts/remixicon.css'

// Top 10 Solana SPL Tokens
const TOP_SPL_TOKENS = [
  'USDC', 'SOL', 'USDT', 'BONK', 'JUP',
  'PYTH', 'JTO', 'WIF', 'RNDR', 'HNT'
] as const

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0B0F19] rounded-t-3xl transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-12 md:mb-16">
          {/* Newsletter */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
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
            <h4 className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
              SUPPORTED TOKENS
            </h4>
            <div className="flex flex-wrap gap-2">
              {TOP_SPL_TOKENS.map(token => (
                <span key={token} className="px-2 py-1 bg-gray-100 dark:bg-gray-800/50 rounded text-xs text-gray-700 dark:text-gray-300 font-mono">
                  {token}
                </span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
              PRODUCT
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {['Features', 'Pricing', 'API Docs', 'Status'].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} 
                        className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer text-sm sm:text-base">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
              COMMUNITY
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { name: 'Twitter', icon: 'ri-twitter-x-line', href: '#' },
                { name: 'Discord', icon: 'ri-discord-line', href: '#' },
                { name: 'GitHub', icon: 'ri-github-line', href: '#' }
              ].map(social => (
                <li key={social.name}>
                  <a href={social.href} 
                     className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <i className={`${social.icon} text-lg sm:text-xl`}></i>
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 order-2 sm:order-1">
            {['twitter-x', 'discord', 'github'].map(social => (
              <a key={social} href="#" 
                 className="text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <i className={`ri-${social}-line text-xl sm:text-2xl`}></i>
              </a>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm order-1 sm:order-2">
            © 2025 FluxPay. Built on Solana. Supporting all top 10 SPL tokens.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 order-3">
            <Link href="/privacy" 
                  className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-xs sm:text-sm cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/terms" 
                  className="text-gray-900 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-xs sm:text-sm cursor-pointer">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}