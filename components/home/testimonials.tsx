'use client'

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Star, CaretLeft, CaretRight } from "@phosphor-icons/react"

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    rating: 5,
    content: "Excellent facility for union members! The location near SMH Hospital made it very convenient for my official visit. Clean rooms, friendly staff, and the subsidized rates are a huge benefit. Highly recommended for all UBEA members.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    rating: 5,
    content: "A wonderful stay experience! The rooms are clean, well-maintained, and the self-cooking kitchen was perfect for my family. We felt safe and comfortable throughout our visit. Great initiative by UBEA and AIBEA for our members.",
  },
  {
    id: 3,
    name: "Amit Patel",
    rating: 5,
    content: "Perfect for retired members like me! The peaceful environment and affordable tariff made my Bhopal visit very enjoyable. The proximity to AIIMS was especially helpful. Union Awaas feels like a home away from home.",
  },
  {
    id: 4,
    name: "Sunita Reddy",
    rating: 5,
    content: "Impressed with the facilities! Used the meeting hall for our regional union gathering and it was perfect. Well-equipped, air-conditioned, and very reasonably priced. The entire team was cooperative and professional.",
  },
  {
    id: 5,
    name: "Vikram Singh",
    rating: 5,
    content: "Outstanding value for members! Stayed here during my training in Bhopal. The rooms are spacious, clean, and comfortable. Having RO water and kitchen facilities is a big plus. Will definitely stay here again on my next visit.",
  },
  {
    id: 6,
    name: "Kavita Desai",
    rating: 5,
    content: "Highly satisfied with the experience! Brought my family for a short vacation and everyone loved it. The secure environment, cleanliness, and member-focused service made our stay memorable. Thank you UBEA for this wonderful facility!",
  },
]

export function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420 // Card width + gap
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })

      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="py-20 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-brown-dark mb-4 leading-tight">
            Guest Experiences
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear what our members have to say about their stay at Union Awaas
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scrollbar-hide pb-6"
          >
            <div className="flex gap-6 min-w-max pb-2">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-tan-light rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[85vw] md:w-[calc((100vw-8rem)/3)] max-w-[380px] flex flex-col"
                >
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} weight="fill" className="text-yellow-500" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-base flex-grow">
                    "{testimonial.content}"
                  </p>

                  {/* Author Name Only */}
                  <div className="border-t border-tan pt-4 mt-auto">
                    <h4 className="font-semibold text-brown-dark text-lg">
                      {testimonial.name}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Desktop */}
          <div className="hidden md:block">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label="Previous testimonials"
            >
              <CaretLeft size={28} weight="bold" className="text-brown-dark group-hover:text-brown-medium transition-colors" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label="Next testimonials"
            >
              <CaretRight size={28} weight="bold" className="text-brown-dark group-hover:text-brown-medium transition-colors" />
            </button>
          </div>

          {/* Navigation Buttons - Mobile */}
          <div className="md:hidden flex justify-center gap-4 mt-8">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-3 bg-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label="Previous testimonials"
            >
              <CaretLeft size={24} weight="bold" className="text-brown-dark" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-3 bg-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label="Next testimonials"
            >
              <CaretRight size={24} weight="bold" className="text-brown-dark" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
