'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChaletHeader } from "@/components/shared/chalet-header"
import { Footer } from "@/components/shared/footer"
import { X } from "@phosphor-icons/react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import type { GalleryImage } from "@/types"

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setImages(data)
      }
      if (error) {
        console.error("Error loading gallery:", error)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <ChaletHeader />

      {/* Hero Banner */}
      <div className="relative h-64 bg-slate-900 flex items-center justify-center mt-20 md:mt-0">
        <div className="text-center text-white px-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Our Gallery
          </h1>
          <p className="text-lg text-white/90">
            A visual journey through our moments
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex-grow">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No images uploaded yet.</p>
          </div>
        ) : (
          /* Bento Grid Layout - Smaller & Centered */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 auto-rows-[160px] max-w-6xl mx-auto grid-flow-dense">
            {images.map((image, index) => {
              // Bento Grid Logic (Pattern of 7)
              const i = index % 7;
              let spanClass = "";

              if (window.innerWidth >= 768) { // Only apply spans on MD+ screens (approximation, purely CSS usually better but conditional classes work)
                // This logic effectively is:
                // 0: Big Box (2x2)
                // 1: Normal
                // 2: Tall (1x2)
                // 3: Normal
                // 4: Wide (2x1)
                // ...
                // We'll trust CSS media queries for the 'md:' prefix instead of js check
              }

              // Simple pattern:
              // 0 -> col-span-2 row-span-2
              // 3 -> col-span-1 row-span-2
              // 6 -> col-span-2 row-span-1
              // others -> col-span-1 row-span-1

              const isLarge = i === 0 || i === 8;
              const isTall = i === 3;
              const isWide = i === 6;

              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={cn(
                    "group relative overflow-hidden rounded-xl shadow-lg cursor-pointer bg-gray-100",
                    // Simple dynamic pattern for Bento feel
                    // First item big, every 7th item big, etc.
                    index === 0 ? "md:col-span-2 md:row-span-2" :
                      index % 10 === 1 ? "md:col-span-1 md:row-span-2" : // Tall
                        index % 10 === 5 ? "md:col-span-2 md:row-span-1" : // Wide
                          index % 10 === 6 ? "md:col-span-2 md:row-span-2" : // Big
                            ""
                  )}
                  onClick={() => setLightboxImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt="Gallery Image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end p-4">
                    {/* Overlay content if needed */}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <X size={24} weight="bold" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.image_url}
              alt="Gallery Preview"
              className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
