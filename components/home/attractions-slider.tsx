'use client'

import { useState, useRef } from 'react'
import { MapPin, CaretLeft, CaretRight } from '@phosphor-icons/react'

const attractions = [
  {
    name: 'Bhojpur',
    distance: '32 km',
    detail: 'from property',
    image: '/bhojpur.jpg',
    attribution: 'Bhojpur Temple',
    size: 'large',
  },
  {
    name: 'Maheshwar',
    distance: '279 km',
    detail: 'from property',
    image: '/maheshwar.jpg',
    attribution: 'Maheshwar Ghats',
    size: 'small',
  },
  {
    name: 'Narmadapuram',
    distance: '75 km',
    detail: 'from property',
    image: '/narmadapuram.jpg',
    attribution: 'Hoshangabad',
    size: 'medium',
  },
  {
    name: 'Omkareshwar',
    distance: '257 km',
    detail: 'from property',
    image: '/omkareshwar.jpg',
    attribution: 'Omkareshwar Temple',
    size: 'medium',
  },
  {
    name: 'Sanchi',
    distance: '49 km',
    detail: 'from property',
    image: '/sanchi.jpg',
    attribution: 'Sanchi Stupa',
    size: 'medium',
  },
  {
    name: 'Ujjain',
    distance: '192 km',
    detail: 'from property',
    image: '/ujjain.jpg',
    attribution: 'Mahakaleshwar Temple',
    size: 'tall',
  },
  {
    name: 'Mandu',
    distance: '286 km',
    detail: 'from property',
    image: '/mandu.png',
    attribution: 'Mandu Fort',
    size: 'small',
  },
]

interface AttractionCardProps {
  name: string
  distance: string
  detail: string
  image: string
  attribution: string
}

function AttractionCard({ name, distance, detail, image, attribution }: AttractionCardProps) {
  return (
    <div className="relative rounded-[20px] overflow-hidden group cursor-pointer h-full">
      {/* Background Image */}
      <img
        src={image}
        alt={`${name} - ${attribution}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        {/* Top - Location Icon */}
        <div className="flex items-start">
          <div className="bg-white/25 backdrop-blur-sm rounded-full p-2.5">
            <MapPin size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Bottom - Text Content */}
        <div className="text-white">
          <div className="flex items-center gap-2 text-sm mb-2 font-medium">
            <MapPin size={14} className="text-white" strokeWidth={2.5} />
            <span>{name}</span>
          </div>
          <div className="font-serif text-5xl font-light mb-1 leading-none tracking-tight">
            {distance}
          </div>
          <div className="text-sm opacity-90 font-light">
            {detail}
          </div>
        </div>
      </div>
    </div>
  )
}

// Decorative dots component
function DecorativeDots() {
  return (
    <>
      {/* Top left cluster */}
      <div className="absolute top-32 left-[15%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Top right cluster */}
      <div className="absolute top-40 right-[12%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Bottom left cluster */}
      <div className="absolute bottom-32 left-[18%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Bottom right cluster */}
      <div className="absolute bottom-40 right-[15%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>
    </>
  )
}

// Mobile Carousel Component
function MobileCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth * 0.75 + 12 // 75% width + gap
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth * 0.75 + 12
      const scrollPosition = carouselRef.current.scrollLeft
      const newIndex = Math.round(scrollPosition / cardWidth)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < attractions.length) {
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
    if (currentIndex < attractions.length - 1) {
      scrollToIndex(currentIndex + 1)
    }
  }

  return (
    <div className="md:hidden relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {attractions.map((attraction, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[75%] snap-center h-[200px]"
          >
            <AttractionCard {...attraction} />
          </div>
        ))}
      </div>

      {/* Navigation Controls - Below Carousel */}
      <div className="flex items-center justify-center gap-4 mt-4">
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
          {attractions.map((_, index) => (
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
          disabled={currentIndex === attractions.length - 1}
          className={`p-2 rounded-full bg-white shadow-md transition-all ${currentIndex === attractions.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:bg-gray-50 active:scale-95'
            }`}
          aria-label="Next"
        >
          <CaretRight size={20} weight="bold" className="text-[#4a3f35]" />
        </button>
      </div>
    </div>
  )
}

export function AttractionsSlider() {
  return (
    <section className="relative py-20 md:py-28 bg-[#f5f1ed] overflow-hidden">
      <DecorativeDots />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-[#4a3f35] mb-6 leading-tight">
            Experience in the heart of Madhya Pradesh
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Happy Holidays is an ideal starting point for exploring the rich cultural
            heritage and natural beauty of Bhopal and Madhya Pradesh – throughout the year.
            Discover ancient monuments, serene lakes, and vibrant wildlife, all within easy
            reach of your tranquil retreat.
          </p>
          <button className="bg-[#4a3f35] text-white px-10 py-4 rounded-lg hover:bg-[#5a4f45] transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg">
            Discover the surroundings
          </button>
        </div>

        {/* Desktop Grid Layout - Masonry Style matching the design */}
        <div className="hidden lg:grid grid-cols-4 gap-5 max-w-7xl mx-auto">
          {/* Column 1: Skiing (tall - 2 rows) */}
          <div className="h-[540px]">
            <AttractionCard {...attractions[0]} />
          </div>

          {/* Column 2: Aquacity (top small) + Treetop (bottom medium) */}
          <div className="flex flex-col gap-5">
            <div className="h-[260px]">
              <AttractionCard {...attractions[1]} />
            </div>
            <div className="h-[260px]">
              <AttractionCard {...attractions[2]} />
            </div>
          </div>

          {/* Column 3: Belianska (top medium) + Lomnický (bottom medium) */}
          <div className="flex flex-col gap-5">
            <div className="h-[260px]">
              <AttractionCard {...attractions[3]} />
            </div>
            <div className="h-[260px]">
              <AttractionCard {...attractions[4]} />
            </div>
          </div>

          {/* Column 4: Climbing wall (tall - 2 rows) + Golf (small at bottom) */}
          <div className="flex flex-col gap-5">
            <div className="h-[340px]">
              <AttractionCard {...attractions[5]} />
            </div>
            <div className="h-[180px]">
              <AttractionCard {...attractions[6]} />
            </div>
          </div>
        </div>

        {/* Tablet Grid Layout */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="h-[400px]">
            <AttractionCard {...attractions[0]} />
          </div>
          <div className="h-[400px]">
            <AttractionCard {...attractions[5]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[1]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[2]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[3]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[4]} />
          </div>
          <div className="h-[280px] col-span-2">
            <AttractionCard {...attractions[6]} />
          </div>
        </div>

        {/* Mobile - Horizontal Carousel */}
        <MobileCarousel />
      </div>
    </section>
  )
}