'use client'

import { Users, Briefcase, UsersThree } from '@phosphor-icons/react'

const audiences = [
  {
    icon: Users,
    title: 'Families with children',
    description: 'Larger families, or several families, who like to seek comfort and prefer the cozy atmosphere of a cottage, but at the same time suffer from a high standard of accommodation.',
  },
  {
    icon: Briefcase,
    title: 'Corporate events',
    description: 'An ideal space for corporate events of up to 12 people who prefer informal spaces for smaller training sessions or teambuilding.',
  },
  {
    icon: UsersThree,
    title: 'Friends',
    description: 'For smaller groups of up to 12 people who prefer privacy and are looking for a relaxed, homely atmosphere combined with luxury. Ideal for friends, acquaintances or ladies weekends.',
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
            For families, companies and groups of friends
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