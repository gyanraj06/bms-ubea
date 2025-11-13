'use client'

import { Users, Sparkle, DeviceMobile, Lock } from '@phosphor-icons/react'

const benefits = [
  {
    icon: Users,
    number: '12+',
    title: 'Guest Capacity',
    description: 'Spacious accommodation for large groups and families'
  },
  {
    icon: Sparkle,
    number: '5★',
    title: 'Wellness & Spa',
    description: 'Premium relaxation facilities and treatments'
  },
  {
    icon: DeviceMobile,
    number: '100%',
    title: 'Smart Technology',
    description: 'Modern amenities and intelligent home systems'
  },
  {
    icon: Lock,
    number: '24/7',
    title: 'Privacy & Security',
    description: 'Complete privacy with round-the-clock safety'
  }
]

export function BenefitsSlider() {
  return (
    <section className="py-16 bg-tan-light">
      <div className="container mx-auto px-4">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-6 min-w-max pb-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="flex-shrink-0 w-72 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-150"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-tan rounded-full flex items-center justify-center">
                      <Icon size={24} weight="fill" className="text-brown-dark" />
                    </div>
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-brown-dark mb-1">{benefit.number}</div>
                      <h3 className="text-lg font-semibold text-brown-dark mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
