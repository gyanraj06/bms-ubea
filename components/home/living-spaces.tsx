'use client'

import { motion } from 'framer-motion'

const spaces = [
  {
    title: 'Day Zone',
    subtitle: 'Relax & Socialize',
    description: 'An open, airy living space designed for gathering with loved ones. Floor-to-ceiling windows flood the room with natural light, while premium furnishings create the perfect atmosphere for both relaxation and entertainment.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200',
    reverse: false,
  },
  {
    title: 'Night Zone',
    subtitle: 'Rest & Rejuvenate',
    description: 'Luxurious bedrooms featuring plush bedding, elegant decor, and thoughtful amenities. Each room is a private sanctuary offering stunning views and absolute tranquility for the perfect night\'s sleep.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200',
    reverse: true,
  },
  {
    title: 'Wellness & Terrace',
    subtitle: 'Refresh & Restore',
    description: 'Indulge in our spa facilities and expansive terrace. From the heated pool to the sauna and outdoor lounging areas, every element is designed to restore your body and refresh your spirit.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200',
    reverse: false,
  },
]

export function LivingSpaces() {
  return (
    <section className="py-20 bg-tan-light">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-24">
          {spaces.map((space, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                space.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative ${space.reverse ? 'lg:order-2' : ''}`}>
                <div className="relative rounded-lg overflow-hidden aspect-[4/3] group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${space.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Decorative Dots */}
                <svg className="absolute -bottom-4 -right-4 opacity-40" width="60" height="60">
                  <circle cx="10" cy="10" r="3" fill="#DDC9B5" />
                  <circle cx="30" cy="10" r="3" fill="#DDC9B5" />
                  <circle cx="50" cy="10" r="3" fill="#DDC9B5" />
                  <circle cx="10" cy="30" r="3" fill="#DDC9B5" />
                  <circle cx="30" cy="30" r="3" fill="#DDC9B5" />
                  <circle cx="50" cy="30" r="3" fill="#DDC9B5" />
                </svg>
              </div>

              {/* Content */}
              <div className={space.reverse ? 'lg:order-1' : ''}>
                <span className="inline-block text-sm font-semibold uppercase tracking-wider text-brown-medium mb-3">
                  {space.subtitle}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-medium text-brown-dark mb-4">
                  {space.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {space.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
