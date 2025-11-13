'use client'

import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Clock, Headset } from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const trustBadges = [
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "100% secure transactions",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Always here to help",
  },
  {
    icon: Headset,
    title: "Concierge Service",
    description: "Personalized assistance",
  },
]

export function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070')`,
                }}
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl max-w-xs">
                <div className="text-4xl font-bold text-primary-700 mb-1">98%</div>
                <p className="text-gray-700 font-medium">Guest Satisfaction</p>
                <p className="text-sm text-gray-500 mt-2">
                  Based on 10,000+ verified reviews
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 text-balance">
              Ready to Experience
              <span className="text-primary-700"> Luxury</span>?
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Book your perfect stay today and discover why guests choose us for unforgettable experiences.
              From elegant rooms to world-class amenities, we ensure every moment is exceptional.
            </p>

            {/* Trust Badges */}
            <div className="space-y-4 pt-4">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon
                return (
                  <motion.div
                    key={badge.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={24} weight="fill" className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button variant="accent" size="xl" asChild>
                <Link href="/booking">
                  Book Your Stay
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
