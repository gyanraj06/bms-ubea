'use client'

import { motion } from 'framer-motion'

const stats = [
  { number: '250+', label: 'Service Rooms' },
  { number: '98%', label: 'Guest Satisfaction' },
  { number: '50K+', label: 'Happy Guests' },
  { number: '25+', label: 'Years Experience' },
  { number: '24/7', label: 'Concierge Service' },
]

export function StatisticsCards() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-tan-light rounded-lg p-6 text-center hover:bg-tan transition-colors duration-150"
            >
              <div className="text-4xl font-bold text-brown-dark mb-2 font-serif">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
