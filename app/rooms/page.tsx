'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Resize, Sparkle, ArrowRight, X, Sliders } from "@phosphor-icons/react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

// Mock data
const allRooms = [
  {
    id: "1",
    name: "Presidential Suite",
    category: "premium",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400",
    price: 25000,
    capacity: 4,
    size: 850,
    amenities: ["Ocean View", "Private Balcony", "Jacuzzi", "King Bed"],
    available: true,
  },
  {
    id: "2",
    name: "Deluxe Ocean View",
    category: "deluxe",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400",
    price: 15000,
    capacity: 2,
    size: 450,
    amenities: ["Ocean View", "King Bed", "Mini Bar", "WiFi"],
    available: true,
  },
  {
    id: "3",
    name: "Garden Villa",
    category: "suite",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400",
    price: 18000,
    capacity: 3,
    size: 600,
    amenities: ["Garden View", "Private Pool", "Kitchen", "Living Area"],
    available: true,
  },
  {
    id: "4",
    name: "Executive Suite",
    category: "suite",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400",
    price: 12000,
    capacity: 2,
    size: 400,
    amenities: ["City View", "Work Desk", "Living Area", "Mini Bar"],
    available: true,
  },
  {
    id: "5",
    name: "Standard Double",
    category: "standard",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=400",
    price: 8000,
    capacity: 2,
    size: 300,
    amenities: ["City View", "Queen Bed", "WiFi", "TV"],
    available: true,
  },
  {
    id: "6",
    name: "Premium Suite",
    category: "premium",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=400",
    price: 22000,
    capacity: 3,
    size: 700,
    amenities: ["Panoramic View", "Balcony", "Bath Tub", "King Bed"],
    available: true,
  },
]

export default function RoomsPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 30000],
    capacity: 0,
    category: "all",
    amenities: [] as string[],
  })
  const [filteredRooms, setFilteredRooms] = useState(allRooms)

  useEffect(() => {
    // Apply filters
    let result = allRooms.filter((room) => {
      const matchPrice = room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1]
      const matchCapacity = filters.capacity === 0 || room.capacity >= filters.capacity
      const matchCategory = filters.category === "all" || room.category === filters.category
      const matchAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) => room.amenities.includes(amenity))

      return matchPrice && matchCapacity && matchCategory && matchAmenities
    })

    setFilteredRooms(result)
  }, [filters])

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 30000],
      capacity: 0,
      category: "all",
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
              max="30000"
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
              <span>{formatCurrency(filters.priceRange[0])}</span>
              <span>{formatCurrency(filters.priceRange[1])}</span>
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

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Room Category
          </label>
          <div className="space-y-2">
            {["all", "standard", "deluxe", "suite", "premium"].map((cat) => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={filters.category === cat}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Amenities
          </label>
          <div className="space-y-2">
            {["Ocean View", "WiFi", "King Bed", "Mini Bar", "Kitchen", "Private Pool"].map((amenity) => (
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
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/rooms/${room.id}`}>
                    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${room.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                          <span className="text-sm font-semibold">
                            {formatCurrency(room.price)}
                          </span>
                          <span className="text-xs">/night</span>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-semibold text-primary-700 uppercase">
                            {room.category}
                          </span>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">
                          {room.name}
                        </h3>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users size={16} weight="fill" className="text-primary-600" />
                            <span>{room.capacity} Guests</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Resize size={16} weight="fill" className="text-primary-600" />
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
                          {room.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
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
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No rooms match your filters</p>
                <Button
                  onClick={clearFilters}
                  variant="default"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
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
