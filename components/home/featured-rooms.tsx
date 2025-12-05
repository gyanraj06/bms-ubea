'use client'

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from "framer-motion"
import { ArrowRight, Users, Resize, Sparkle } from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const featuredRooms = [
  {
    id: "1",
    name: "Presidential Suite",
    category: "premium",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
    price: 25000,
    capacity: 4,
    size: 850,
    amenities: ["Ocean View", "Private Balcony", "Jacuzzi"],
  },
  {
    id: "2",
    name: "Deluxe Ocean View",
    category: "deluxe",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074",
    price: 15000,
    capacity: 2,
    size: 450,
    amenities: ["Ocean View", "King Bed", "Mini Bar"],
  },
  {
    id: "3",
    name: "Garden Villa",
    category: "suite",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
    price: 18000,
    capacity: 3,
    size: 600,
    amenities: ["Garden View", "Private Pool", "Kitchen"],
  },
  {
    id: "4",
    name: "Executive Suite",
    category: "suite",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=2074",
    price: 12000,
    capacity: 2,
    size: 400,
    amenities: ["City View", "Work Desk", "Living Area"],
  },
]

export function FeaturedRooms() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    dragFree: true,
  })

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Rooms
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of Service accommodations designed for your comfort
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {featuredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
              >
                <Link href={`/rooms/${room.id}`}>
                  <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('${room.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="text-sm font-semibold">{formatCurrency(room.price)}</span>
                        <span className="text-xs">/night</span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                          {room.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                        {room.name}
                      </h3>

                      {/* Quick Stats */}
                      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users size={18} weight="fill" className="text-primary-600" />
                          <span>{room.capacity} Guests</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Resize size={18} weight="fill" className="text-primary-600" />
                          <span>{room.size} sq ft</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center space-x-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                          >
                            <Sparkle size={12} weight="fill" />
                            <span>{amenity}</span>
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                          View Details
                        </span>
                        <ArrowRight
                          size={20}
                          weight="bold"
                          className="text-primary-600 group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="default" size="lg" asChild>
            <Link href="/rooms">
              View All Rooms
              <ArrowRight size={20} weight="bold" className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
