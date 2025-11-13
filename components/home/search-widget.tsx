'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { MagnifyingGlass, Calendar, Users } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function SearchWidget() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: "all",
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate search delay
    setTimeout(() => {
      const params = new URLSearchParams({
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        roomType: formData.roomType,
      })
      router.push(`/rooms?${params.toString()}`)
      setIsLoading(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="flex items-center space-x-2">
                <Calendar size={18} className="text-primary-600" weight="bold" />
                <span>Check-in</span>
              </Label>
              <Input
                id="checkIn"
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="flex items-center space-x-2">
                <Calendar size={18} className="text-primary-600" weight="bold" />
                <span>Check-out</span>
              </Label>
              <Input
                id="checkOut"
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center space-x-2">
                <Users size={18} className="text-primary-600" weight="bold" />
                <span>Guests</span>
              </Label>
              <select
                id="guests"
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <select
                id="roomType"
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              variant="accent"
              size="xl"
              disabled={isLoading}
              className="min-w-[200px] group"
            >
              <MagnifyingGlass
                size={20}
                weight="bold"
                className="mr-2 group-hover:scale-110 transition-transform"
              />
              {isLoading ? "Searching..." : "Search Rooms"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
