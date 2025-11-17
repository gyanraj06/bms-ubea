'use client'

import { MapPin } from '@phosphor-icons/react'

const attractions = [
  {
    name: 'Upper Lake',
    distance: '3 km',
    detail: 'from property',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
    attribution: 'Beautiful lake view',
    size: 'large',
  },
  {
    name: 'Van Vihar National Park',
    distance: '5 km',
    detail: 'from property',
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80',
    attribution: 'Wildlife sanctuary',
    size: 'small',
  },
  {
    name: 'Sanchi Stupa',
    distance: '46 km',
    detail: 'UNESCO World Heritage',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    attribution: 'Ancient Buddhist monument',
    size: 'medium',
  },
  {
    name: 'Bhimbetka Rock Shelters',
    distance: '45 km',
    detail: 'UNESCO World Heritage',
    image: 'https://images.unsplash.com/photo-1620857520284-02ac92bc2ce1?w=800&auto=format&fit=crop&q=80',
    attribution: 'Prehistoric cave paintings',
    size: 'medium',
  },
  {
    name: 'Taj-ul-Masajid',
    distance: '4 km',
    detail: 'from property',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop&q=80',
    attribution: 'Historic mosque',
    size: 'medium',
  },
  {
    name: 'Regional Science Centre',
    distance: '6 km',
    detail: 'from property',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    attribution: 'Educational attraction',
    size: 'tall',
  },
  {
    name: 'Boat Club',
    distance: '3 km',
    detail: 'from property',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    attribution: 'Boating experience',
    size: 'small',
  },
]

interface AttractionCardProps {
  name: string
  distance: string
  detail: string
  image: string
  attribution: string
}

function AttractionCard({ name, distance, detail, image, attribution }: AttractionCardProps) {
  return (
    <div className="relative rounded-[20px] overflow-hidden group cursor-pointer h-full">
      {/* Background Image */}
      <img
        src={image}
        alt={`${name} - ${attribution}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        {/* Top - Location Icon */}
        <div className="flex items-start">
          <div className="bg-white/25 backdrop-blur-sm rounded-full p-2.5">
            <MapPin size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Bottom - Text Content */}
        <div className="text-white">
          <div className="flex items-center gap-2 text-sm mb-2 font-medium">
            <MapPin size={14} className="text-white" strokeWidth={2.5} />
            <span>{name}</span>
          </div>
          <div className="font-serif text-5xl font-light mb-1 leading-none tracking-tight">
            {distance}
          </div>
          <div className="text-sm opacity-90 font-light">
            {detail}
          </div>
        </div>
      </div>
    </div>
  )
}

// Decorative dots component
function DecorativeDots() {
  return (
    <>
      {/* Top left cluster */}
      <div className="absolute top-32 left-[15%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Top right cluster */}
      <div className="absolute top-40 right-[12%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Bottom left cluster */}
      <div className="absolute bottom-32 left-[18%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>

      {/* Bottom right cluster */}
      <div className="absolute bottom-40 right-[15%] hidden lg:block">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
          <div className="w-2 h-2 rounded-full bg-[#d4b5a0]/40" />
        </div>
      </div>
    </>
  )
}

export function AttractionsSlider() {
  return (
    <section className="relative py-20 md:py-28 bg-[#f5f1ed] overflow-hidden">
      <DecorativeDots />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-[#4a3f35] mb-6 leading-tight">
            Experience in the heart of Madhya Pradesh
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Happy Holidays is an ideal starting point for exploring the rich cultural
            heritage and natural beauty of Bhopal and Madhya Pradesh – throughout the year.
            Discover ancient monuments, serene lakes, and vibrant wildlife, all within easy
            reach of your tranquil retreat.
          </p>
          <button className="bg-[#4a3f35] text-white px-10 py-4 rounded-lg hover:bg-[#5a4f45] transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg">
            Discover the surroundings
          </button>
        </div>

        {/* Desktop Grid Layout - Masonry Style matching the design */}
        <div className="hidden lg:grid grid-cols-4 gap-5 max-w-7xl mx-auto">
          {/* Column 1: Skiing (tall - 2 rows) */}
          <div className="h-[540px]">
            <AttractionCard {...attractions[0]} />
          </div>

          {/* Column 2: Aquacity (top small) + Treetop (bottom medium) */}
          <div className="flex flex-col gap-5">
            <div className="h-[260px]">
              <AttractionCard {...attractions[1]} />
            </div>
            <div className="h-[260px]">
              <AttractionCard {...attractions[2]} />
            </div>
          </div>

          {/* Column 3: Belianska (top medium) + Lomnický (bottom medium) */}
          <div className="flex flex-col gap-5">
            <div className="h-[260px]">
              <AttractionCard {...attractions[3]} />
            </div>
            <div className="h-[260px]">
              <AttractionCard {...attractions[4]} />
            </div>
          </div>

          {/* Column 4: Climbing wall (tall - 2 rows) + Golf (small at bottom) */}
          <div className="flex flex-col gap-5">
            <div className="h-[340px]">
              <AttractionCard {...attractions[5]} />
            </div>
            <div className="h-[180px]">
              <AttractionCard {...attractions[6]} />
            </div>
          </div>
        </div>

        {/* Tablet Grid Layout */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="h-[400px]">
            <AttractionCard {...attractions[0]} />
          </div>
          <div className="h-[400px]">
            <AttractionCard {...attractions[5]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[1]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[2]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[3]} />
          </div>
          <div className="h-[280px]">
            <AttractionCard {...attractions[4]} />
          </div>
          <div className="h-[280px] col-span-2">
            <AttractionCard {...attractions[6]} />
          </div>
        </div>

        {/* Mobile - Simple Stack */}
        <div className="grid md:hidden grid-cols-1 gap-5 max-w-md mx-auto">
          {attractions.map((attraction, index) => (
            <div key={index} className="h-[360px]">
              <AttractionCard {...attraction} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}