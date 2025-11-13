'use client'

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from "framer-motion"
import { Star, Quotes } from "@phosphor-icons/react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Travel Blogger",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    content: "Absolutely stunning property! The attention to detail and exceptional service made our stay unforgettable. The rooms are spacious, beautifully designed, and offer breathtaking views.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Business Executive",
    avatar: "https://i.pravatar.cc/150?img=13",
    rating: 5,
    content: "Perfect for business stays. The facilities are world-class, and the staff goes above and beyond. The high-speed internet and quiet work spaces were exactly what I needed.",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Newlywed",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    content: "Our honeymoon was magical here! The romantic ambiance, private dining, and spa treatments were exceptional. We couldn't have asked for a better experience.",
  },
  {
    id: 4,
    name: "David Martinez",
    role: "Family Vacationer",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    content: "Family-friendly and luxurious! The kids loved the pool and activities, while we enjoyed the spa and fine dining. Something for everyone in the family.",
  },
]

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="py-20 bg-gray-50">
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
              Guest Experiences
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear what our guests have to say about their stay
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 shadow-lg h-full relative"
                >
                  {/* Quote Icon */}
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <Quotes size={24} weight="fill" className="text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex space-x-1 mb-4 mt-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} weight="fill" className="text-accent-500" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex % testimonials.length
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
