import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Check, Zap } from 'lucide-react'

interface PricingPlan {
  name: string
  price: string | number
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
  href: string
}

const monthlyPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfect for testing and getting started',
    features: [
      'Up to 100 transactions/month',
      'Basic payment processing',
      'Solana mainnet & devnet',
      'Email support',
      'Standard settlement (weekly)',
      'Basic webhooks',
      '14-day free trial',
    ],
    cta: 'Start Free Trial',
    href: '/auth',
  },
  {
    name: 'Pro',
    price: '50',
    period: '/month',
    description: 'Ideal for growing businesses',
    features: [
      'Unlimited transactions',
      'Advanced payment processing',
      'Multiple token support',
      'Priority email support',
      'Fast settlement (daily)',
      'Advanced webhooks & retries',
      'Custom branding options',
      'API access',
      'Transaction reports',
      'Analytics dashboard',
      '3 months free trial',
    ],
    highlighted: true,
    cta: 'Get Started',
    href: '/auth',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For high-volume merchants and platforms',
    features: [
      'Unlimited everything',
      'Custom token pairs',
      'Dedicated account manager',
      '24/7 phone support',
      'Instant settlement',
      'Custom webhooks',
      'White-label options',
      'Advanced API features',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

const yearlyPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfect for testing and getting started',
    features: [
      'Up to 100 transactions/month',
      'Basic payment processing',
      'Solana mainnet & devnet',
      'Email support',
      'Standard settlement (weekly)',
      'Basic webhooks',
      '14-day free trial',
    ],
    cta: 'Start Free Trial',
    href: '/auth',
  },
  {
    name: 'Pro',
    price: '500',
    period: '/year',
    description: 'Ideal for growing businesses (Save 17%)',
    features: [
      'Unlimited transactions',
      'Advanced payment processing',
      'Multiple token support',
      'Priority email support',
      'Fast settlement (daily)',
      'Advanced webhooks & retries',
      'Custom branding options',
      'API access',
      'Transaction reports',
      'Analytics dashboard',
      '3 months free trial',
    ],
    highlighted: true,
    cta: 'Get Started',
    href: '/auth',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For high-volume merchants and platforms',
    features: [
      'Unlimited everything',
      'Custom token pairs',
      'Dedicated account manager',
      '24/7 phone support',
      'Instant settlement',
      'Custom webhooks',
      'White-label options',
      'Advanced API features',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

const Pricing: NextPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const plans = billingPeriod === 'monthly' ? monthlyPlans : yearlyPlans
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Transparent Pricing for Solana Payments
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the perfect plan for your Solana SPL payment needs. No hidden fees, no surprises.
              </p>
            </motion.div>

            {/* Billing Period Toggle */}
            <motion.div
              className="flex items-center justify-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                    billingPeriod === 'yearly'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div
                    className={`h-full rounded-2xl transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] p-0.5 scale-105 shadow-2xl shadow-purple-500/30'
                        : 'bg-white dark:bg-gray-900/50'
                    }`}
                  >
                    <div
                      className={`h-full rounded-[15px] p-8 flex flex-col ${
                        plan.highlighted
                          ? 'bg-white dark:bg-[#0B0F19]'
                          : 'border border-gray-200 dark:border-white/[0.06]'
                      }`}
                    >
                      {plan.highlighted && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-teal-100 dark:from-purple-500/20 dark:to-teal-500/20">
                            <Zap size={14} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">MOST POPULAR</span>
                          </span>
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <div>
                          <span className="text-5xl font-bold text-gray-900 dark:text-white">
                            ${plan.price}
                          </span>
                          {plan.period && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {plan.period}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={plan.href}>
                        <button
                          className={`w-full py-3 px-6 rounded-xl font-semibold mb-8 transition-all duration-200 cursor-pointer ${
                            plan.highlighted
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white hover:opacity-90 shadow-lg shadow-purple-500/20'
                              : 'bg-gray-100 dark:bg-white/[0.05] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.1]'
                          }`}
                        >
                          {plan.cta}
                        </button>
                      </Link>

                      <div className="space-y-4 flex-1">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Check size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FAQ / Comparison */}
            <div className="mt-20">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  {
                    q: 'Can I upgrade or downgrade my plan?',
                    a: 'Yes, you can change your plan anytime. Changes take effect at the next billing cycle.',
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major Solana tokens (SOL, USDC, USDT) and can convert to your preferred token.',
                  },
                  {
                    q: 'Is there a contract?',
                    a: 'No, all plans are month-to-month or yearly with no long-term contracts. Cancel anytime.',
                  },
                  {
                    q: 'Do you offer support?',
                    a: 'Yes, all plans include support. Pro gets priority email, Enterprise gets dedicated 24/7 support.',
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.q}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              className="mt-20 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] rounded-2xl p-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                Join thousands of merchants accepting Solana payments with FluxPay
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <button className="px-8 py-3 bg-white text-[#8B5CF6] font-semibold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    Start Free Trial
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-8 py-3 bg-white/20 border border-white text-white font-semibold rounded-xl hover:bg-white/30 transition-colors cursor-pointer">
                    Contact Sales
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Pricing
