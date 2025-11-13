'use client'

import { motion } from "framer-motion"
import {
  SwimmingPool,
  Barbell,
  Coffee,
  WifiHigh,
  CarProfile,
  Heartbeat,
  ForkKnife,
  PlayCircle,
} from "@phosphor-icons/react"

const facilities = [
  {
    icon: SwimmingPool,
    title: "Swimming Pool",
    description: "Olympic-sized heated pool with poolside bar",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Barbell,
    title: "Fitness Center",
    description: "State-of-the-art gym with personal trainers",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: ForkKnife,
    title: "Fine Dining",
    description: "Multiple restaurants with world cuisine",
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: Heartbeat,
    title: "Spa & Wellness",
    description: "Rejuvenating treatments and massage therapy",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: WifiHigh,
    title: "High-Speed WiFi",
    description: "Complimentary internet throughout the property",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: CarProfile,
    title: "Valet Parking",
    description: "Secure parking with 24/7 valet service",
    color: "from-gray-500 to-slate-600",
  },
  {
    icon: Coffee,
    title: "Café & Lounge",
    description: "Premium coffee and cocktails all day",
    color: "from-brown-500 to-amber-700",
  },
  {
    icon: PlayCircle,
    title: "Entertainment",
    description: "Gaming zone and home theater",
    color: "from-green-500 to-emerald-500",
  },
]

export function Facilities() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              World-Class Facilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for a perfect stay, all in one place
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility, index) => {
            const Icon = facility.icon
            return (
              <motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className={`
                  group relative bg-gradient-to-br ${facility.color}
                  rounded-2xl p-6 overflow-hidden cursor-pointer
                  hover:shadow-2xl transition-all duration-300
                  ${index === 0 ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : ''}
                  ${index === 3 ? 'lg:row-span-2' : ''}
                `}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon size={32} weight="fill" className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {facility.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {facility.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold flex items-center">
                      Learn More
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="ml-2"
                      >
                        →
                      </motion.span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
