'use client'

import { useState, useRef } from 'react'
import { UserCircle, Presentation, UsersThree, CaretLeft, CaretRight } from '@phosphor-icons/react'

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


// Mobile Carousel Component
function AudienceMobileCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth // 100% width for these cards
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth
      const scrollPosition = carouselRef.current.scrollLeft
      const newIndex = Math.round(scrollPosition / cardWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < audiences.length) {
        setCurrentIndex(newIndex)
      }
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < audiences.length - 1) {
      scrollToIndex(currentIndex + 1)
    }
  }

  return (
    <div className="md:hidden relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4 gap-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {audiences.map((audience, index) => {
          const Icon = audience.icon
          return (
            <div
              key={index}
              className="flex-shrink-0 w-full snap-center"
            >
              <div className="relative bg-[#ebe5df] rounded-2xl p-8 h-full">
                <CardDots />

                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Icon size={40} weight="regular" className="text-[#4a3f35]" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#4a3f35] mb-4">
                    {audience.title}
                  </h3>
                  <p className="text-[#6b5d52] leading-relaxed text-base">
                    {audience.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Controls - Below Carousel */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Left Arrow */}
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full bg-white shadow-md transition-all ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:bg-gray-50 active:scale-95'
            }`}
          aria-label="Previous"
        >
          <CaretLeft size={20} weight="bold" className="text-[#4a3f35]" />
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {audiences.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
                ? 'bg-[#4a3f35] w-6'
                : 'bg-[#4a3f35]/30 hover:bg-[#4a3f35]/50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          disabled={currentIndex === audiences.length - 1}
          className={`p-2 rounded-full bg-white shadow-md transition-all ${currentIndex === audiences.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:bg-gray-50 active:scale-95'
            }`}
          aria-label="Next"
        >
          <CaretRight size={20} weight="bold" className="text-[#4a3f35]" />
        </button>
      </div>
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

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
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

        <AudienceMobileCarousel />
      </div>
    </section>
  )
}