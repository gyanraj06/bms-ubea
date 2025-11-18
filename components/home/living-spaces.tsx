'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

const spaces = [
  {
    title: 'Day Zone',
    subtitle: 'Relax & Socialize',
    description: 'An open, airy living space designed for gathering with loved ones. Floor-to-ceiling windows flood the room with natural light, while premium furnishings create the perfect atmosphere for both relaxation and entertainment.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200',
  },
  {
    title: 'Night Zone',
    subtitle: 'Rest & Rejuvenate',
    description: 'Luxurious bedrooms featuring plush bedding, elegant decor, and thoughtful amenities. Each room is a private sanctuary offering stunning views and absolute tranquility for the perfect night\'s sleep.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200',
  },
  {
    title: 'Wellness & Terrace',
    subtitle: 'Refresh & Restore',
    description: 'Indulge in our spa facilities and expansive terrace. From the heated pool to the sauna and outdoor lounging areas, every element is designed to restore your body and refresh your spirit.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200',
  },
]

export function LivingSpaces() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spaces.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % spaces.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + spaces.length) % spaces.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-tan-light to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Carousel Container */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[500px] lg:min-h-[600px]">
                  {/* Image Side */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative order-2 lg:order-1"
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/2] lg:aspect-[4/3]">
                      <img
                        src={spaces[currentIndex].image}
                        alt={spaces[currentIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                      {/* Image Overlay Text */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-white/90 text-sm font-medium tracking-wider uppercase">
                          {spaces[currentIndex].subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Content Side */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="order-1 lg:order-2 flex flex-col justify-center"
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-brown-dark mb-4 leading-tight">
                          {spaces[currentIndex].title}
                        </h3>
                        <div className="w-20 h-1 bg-tan rounded-full" />
                      </div>

                      <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
                        {spaces[currentIndex].description}
                      </p>

                      {/* Progress Bar */}
                      <div className="pt-4">
                        <div className="flex gap-2">
                          {spaces.map((_, index) => (
                            <div
                              key={index}
                              className="relative h-1 flex-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                              onClick={() => handleDotClick(index)}
                            >
                              {index === currentIndex && (
                                <motion.div
                                  className="absolute inset-0 bg-brown-dark rounded-full"
                                  initial={{ width: '0%' }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 6, ease: 'linear' }}
                                />
                              )}
                              {index < currentIndex && (
                                <div className="absolute inset-0 bg-brown-dark rounded-full" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <CaretLeft size={28} weight="bold" className="text-brown-dark group-hover:text-brown-medium transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
                aria-label="Next slide"
              >
                <CaretRight size={28} weight="bold" className="text-brown-dark group-hover:text-brown-medium transition-colors" />
              </button>
            </div>

            {/* Navigation Arrows - Mobile */}
            <div className="lg:hidden flex justify-center gap-4 mt-8">
              <button
                onClick={handlePrev}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                aria-label="Previous slide"
              >
                <CaretLeft size={24} weight="bold" className="text-brown-dark" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                aria-label="Next slide"
              >
                <CaretRight size={24} weight="bold" className="text-brown-dark" />
              </button>
            </div>
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-8">
            <p className="text-sm font-medium text-gray-500">
              {currentIndex + 1} / {spaces.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
