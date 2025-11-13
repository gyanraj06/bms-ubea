'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { X } from "@phosphor-icons/react"

const categories = ["All", "Rooms", "Halls", "Amenities", "Dining", "Exteriors"]

const galleryImages = [
  { id: 1, category: "Rooms", src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800", alt: "Presidential Suite" },
  { id: 2, category: "Rooms", src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800", alt: "Deluxe Room" },
  { id: 3, category: "Amenities", src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800", alt: "Swimming Pool" },
  { id: 4, category: "Dining", src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800", alt: "Restaurant" },
  { id: 5, category: "Halls", src: "https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?q=80&w=800", alt: "Conference Hall" },
  { id: 6, category: "Exteriors", src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800", alt: "Hotel Exterior" },
  { id: 7, category: "Rooms", src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800", alt: "Garden Villa" },
  { id: 8, category: "Amenities", src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800", alt: "Spa" },
  { id: 9, category: "Dining", src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800", alt: "Fine Dining" },
  { id: 10, category: "Halls", src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800", alt: "Banquet Hall" },
  { id: 11, category: "Amenities", src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800", alt: "Gym" },
  { id: 12, category: "Exteriors", src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800", alt: "Night View" },
]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [lightboxImage, setLightboxImage] = useState<typeof galleryImages[0] | null>(null)

  const filteredImages = selectedCategory === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Gallery
          </h1>
          <p className="text-lg text-white/90">
            A visual journey through our luxury property
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-square"
              onClick={() => setLightboxImage(image)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${image.src}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold">{image.alt}</p>
                  <p className="text-white/80 text-sm">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X size={24} className="text-white" weight="bold" />
          </button>

          <div className="max-w-6xl w-full">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="w-full h-auto rounded-lg"
            />
            <div className="text-center mt-6">
              <h3 className="text-white text-2xl font-semibold mb-2">
                {lightboxImage.alt}
              </h3>
              <p className="text-white/70">{lightboxImage.category}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
