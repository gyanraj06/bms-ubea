'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Resize, Sparkle, Bed, X, Sliders } from "@phosphor-icons/react"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

interface Room {
  id: string
  room_number: string
  room_type: string
  bed_type: string
  max_guests: number
  base_price: number
  size_sqft: number
  view_type: string | null
  is_available: boolean
  amenities: string[]
  images: string[]
  description: string
}

export default function RoomsPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    capacity: 0,
    amenities: [] as string[],
  })

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/rooms')
        const data = await response.json()

        if (data.success) {
          setAllRooms(data.rooms || [])
          setFilteredRooms(data.rooms || [])
        } else {
          toast.error('Failed to load rooms')
          setAllRooms([])
          setFilteredRooms([])
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
        toast.error('Failed to load rooms')
        setAllRooms([])
        setFilteredRooms([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = allRooms.filter((room) => {
      const matchPrice = room.base_price >= filters.priceRange[0] && room.base_price <= filters.priceRange[1]
      const matchCapacity = filters.capacity === 0 || room.max_guests >= filters.capacity
      const matchAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) => room.amenities.includes(amenity))

      return matchPrice && matchCapacity && matchAmenities
    })

    setFilteredRooms(result)
  }, [filters, allRooms])

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 50000],
      capacity: 0,
      amenities: [],
    })
  }

  const FilterSidebar = ({ className = "" }: { className?: string }) => (
    <div className={className}>
      <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Price Range
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [0, parseInt(e.target.value)],
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{filters.priceRange[0].toLocaleString()}</span>
              <span>₹{filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Minimum Capacity
          </label>
          <select
            value={filters.capacity}
            onChange={(e) =>
              setFilters({ ...filters, capacity: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="0">Any</option>
            <option value="1">1+ Guests</option>
            <option value="2">2+ Guests</option>
            <option value="3">3+ Guests</option>
            <option value="4">4+ Guests</option>
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Amenities
          </label>
          <div className="space-y-2">
            {["Ocean View", "WiFi", "King Bed", "Parking", "Kitchen", "Private Pool"].map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({
                        ...filters,
                        amenities: [...filters.amenities, amenity],
                      })
                    } else {
                      setFilters({
                        ...filters,
                        amenities: filters.amenities.filter((a) => a !== amenity),
                      })
                    }
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Rooms & Suites
          </h1>
          <p className="text-lg text-white/90">
            Find your perfect accommodation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar className="hidden lg:block" />

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setIsMobileFilterOpen(true)}
                variant="outline"
                className="w-full"
              >
                <Sliders size={20} weight="bold" className="mr-2" />
                Filters
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                <span className="font-semibold">{filteredRooms.length}</span> rooms available
              </p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room, index) => {
                const hasImage = room.images && room.images.length > 0
                const roomImage = hasImage ? room.images[0] : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400'

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={roomImage}
                          alt={room.room_type}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1.5 rounded-full shadow-lg z-10">
                          <span className="text-sm font-semibold">
                            ₹{room.base_price.toLocaleString()}
                          </span>
                          <span className="text-xs">/night</span>
                        </div>

                        {/* Availability Badge */}
                        {!room.is_available && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full z-10">
                            <span className="text-xs font-semibold uppercase">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                          {room.room_type}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Room #{room.room_number} {room.view_type && `• ${room.view_type}`}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users size={16} weight="fill" className="text-primary-600" />
                            <span>{room.max_guests} Guests</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bed size={16} weight="fill" className="text-primary-600" />
                            <span>{room.bed_type}</span>
                          </div>
                          {room.size_sqft > 0 && (
                            <div className="flex items-center space-x-1">
                              <Resize size={16} weight="fill" className="text-primary-600" />
                              <span>{room.size_sqft} sq ft</span>
                            </div>
                          )}
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
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
                            {room.amenities.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <div className="pt-4 border-t border-gray-200">
                          <Link href="/booking" className="block">
                            <Button
                              className="w-full bg-primary-600 hover:bg-primary-700"
                              disabled={!room.is_available}
                            >
                              {room.is_available ? 'Book Now' : 'Unavailable'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900">Loading rooms...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredRooms.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Bed size={48} weight="fill" className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-4">
                  {allRooms.length === 0 ? 'No rooms available' : 'No rooms match your filters'}
                </p>
                {allRooms.length > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="default"
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
