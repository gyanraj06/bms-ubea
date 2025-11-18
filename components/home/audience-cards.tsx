'use client'

import { UserCircle, Presentation, UsersThree } from '@phosphor-icons/react'

const audiences = [
  {
    icon: UserCircle,
    title: 'UBEA/AIBEA Members',
    description: 'Whether you\'re visiting Bhopal for personal work, a short trip, or official bank duties, Union Awaas is your home base. We provide a secure, comfortable, and highly affordable stay for all serving and retired members.',
  },
  {
    icon: Presentation,
    title: 'Meetings & Functions',
    description: 'Our air-conditioned hall can comfortably host 50-60 guests. It\'s the perfect, budget-friendly venue for union meetings, official gatherings, or small private functions. (Note: Hall booking is a separate process).',
  },
  {
    icon: UsersThree,
    title: 'Members\' Families',
    description: 'We warmly welcome the families of our members. Our facility offers a safe environment and the convenience of a self-cooking kitchen with RO water, making it an ideal and economical choice for families traveling together.',
  },
]

// Decorative dots component for cards
function CardDots() {
  return (
    <div className="absolute top-6 right-6 flex gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#d4b5a0]/50" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#d4b5a0]/50" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#d4b5a0]/50" />
    </div>
  )
}

export function AudienceCards() {
  return (
    <section className="py-20 md:py-24 bg-[#f5f1ed]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-[#4a3f35] mb-4 leading-tight max-w-3xl mx-auto">
            For Our Members, Their Families, and Official Functions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <div
                key={index}
                className="relative bg-[#ebe5df] rounded-2xl p-8 hover:shadow-md transition-shadow duration-300"
              >
                <CardDots />
                
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Icon size={40} weight="regular" className="text-[#4a3f35]" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#4a3f35] mb-4">
                    {audience.title}
                  </h3>
                  <p className="text-[#6b5d52] leading-relaxed text-base">
                    {audience.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}