'use client'

import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { Users, Resize, Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr"
import { formatCurrency } from "@/lib/utils"

// Mock data - in real app, this would come from API
const roomDetails = {
  id: "1",
  name: "Presidential Suite",
  category: "premium",
  images: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200",
  ],
  price: 25000,
  capacity: 4,
  size: 850,
  description: "Experience the pinnacle of Service in our Presidential Suite. This expansive accommodation features elegant furnishings, breathtaking views, and exclusive amenities designed for the most discerning guests.",
  amenities: [
    "Ocean View",
    "Private Balcony",
    "Jacuzzi",
    "King Bed",
    "Living Area",
    "Work Desk",
    "Parking",
    "Safe",
    "Smart TV",
    "High-Speed WiFi",
    "24/7 Room Service",
    "Premium Toiletries",
  ],
  features: [
    "Separate living and sleeping areas",
    "Marble bathroom with rainfall shower",
    "Private balcony with panoramic views",
    "Complimentary breakfast",
    "Evening turndown service",
    "Personalized concierge service",
  ],
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12 mt-20">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="relative h-96 md:h-[600px] rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${roomDetails.images[0]}')` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {roomDetails.images.slice(1).map((img, idx) => (
              <div key={idx} className="relative h-44 md:h-72 rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${img}')` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                  {roomDetails.category}
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {roomDetails.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users size={24} weight="fill" className="text-primary-600" />
                  <span>{roomDetails.capacity} Guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Resize size={24} weight="fill" className="text-primary-600" />
                  <span>{roomDetails.size} sq ft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{roomDetails.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roomDetails.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <Sparkle size={16} weight="fill" className="text-primary-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Features</h2>
              <ul className="space-y-2">
                {roomDetails.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-2 text-gray-700">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Policies</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Check-in:</strong> 2:00 PM</p>
                <p><strong>Check-out:</strong> 12:00 PM</p>
                <p><strong>Cancellation:</strong> Free cancellation up to 48 hours before check-in</p>
                <p><strong>Pets:</strong> Not allowed</p>
                <p><strong>Smoking:</strong> Non-smoking room</p>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(roomDetails.price)}
                  </span>
                  <span className="text-gray-600">/night</span>
                </div>

              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {Array.from({ length: roomDetails.capacity }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <a
                href="/booking"
                className="w-full flex items-center justify-center h-12 px-6 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white font-medium hover:shadow-xl transition-all"
              >
                Reserve Now
                <ArrowRight size={20} weight="bold" className="ml-2" />
              </a>

              <p className="text-xs text-center text-gray-500 mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
