'use client'

import { MapPin } from '@phosphor-icons/react'

const attractions = [
  {
    name: 'Skiing',
    distance: '24 km',
    detail: 'slopes',
    image: 'https://images.unsplash.com/photo-1701358232769-998897181fba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxza2lpbmclMjBzbm93JTIwbW91bnRhaW5zJTIwd2ludGVyJTIwc2xvcGVzfGVufDB8MXx8fDE3NjI4NDUyNDR8MA&ixlib=rb-4.1.0&q=85',
    attribution: 'Soonmok Kwon on Unsplash',
    size: 'large',
  },
  {
    name: 'Aquacity Poprad',
    distance: '9 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1646702423992-abcca5bc2c12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxzd2ltbWluZyUyMHBvb2wlMjB3YXRlciUyMGFxdWElMjBwYXJrJTIwYmx1ZXxlbnwwfDJ8fGJsdWV8MTc2Mjg0NTI0NHww&ixlib=rb-4.1.0&q=85',
    attribution: 'Joseph Kellner on Unsplash',
    size: 'small',
  },
  {
    name: 'Treetop walkway',
    distance: '24 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1604626677347-525ed59b5ebb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx0cmVldG9wJTIwd2Fsa3dheSUyMGZvcmVzdCUyMHRyZWVzJTIwd29vZGVuJTIwYnJpZGdlfGVufDB8MHx8Z3JlZW58MTc2Mjg0NTI0NHww&ixlib=rb-4.1.0&q=85',
    attribution: 'Jaime Dantas on Unsplash',
    size: 'medium',
  },
  {
    name: 'Belianska Cave',
    distance: '9 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1620857520284-02ac92bc2ce1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxjYXZlJTIwc3RhbGFjdGl0ZXMlMjByb2NrJTIwZm9ybWF0aW9ucyUyMHVuZGVyZ3JvdW5kfGVufDB8Mnx8fDE3NjI4NDUyNDR8MA&ixlib=rb-4.1.0&q=85',
    attribution: 'Intricate Explorer on Unsplash',
    size: 'medium',
  },
  {
    name: 'Lomnický štít',
    distance: '19 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1758916922378-a17f51ba056a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxtb3VudGFpbiUyMHBlYWslMjByb2NreSUyMG1vdW50YWlucyUyMHN1bnNldCUyMGRyYW1hdGljJTIwbGFuZHNjYXBlfGVufDB8MHx8fDE3NjI4NDUyNDR8MA&ixlib=rb-4.1.0&q=85',
    attribution: 'Marek Piwnicki on Unsplash',
    size: 'medium',
  },
  {
    name: 'Climbing wall Wall',
    distance: '9 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1683527945242-904da014fbb8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjbGltYmluZyUyMHdhbGwlMjByb2NrJTIwY2xpbWJpbmclMjBjb2xvcmZ1bCUyMGhvbGRzJTIwcGVyc29uJTIwY2xpbWJpbmd8ZW58MHwxfHx8MTc2Mjg0NTI0NXww&ixlib=rb-4.1.0&q=85',
    attribution: 'Luis Andrés Villalón Vega on Unsplash',
    size: 'tall',
  },
  {
    name: 'Golf Black Store',
    distance: '4 km',
    detail: 'od Chalet Matthe',
    image: 'https://images.unsplash.com/photo-1596475380310-d8db2aa35b1f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxnb2xmJTIwY291cnNlJTIwZ29sZmVyJTIwZ3JlZW4lMjBncmFzcyUyMHNwb3J0fGVufDB8MHx8Z3JlZW58MTc2Mjg0NTI0OHww&ixlib=rb-4.1.0&q=85',
    attribution: 'Peter Drew on Unsplash',
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
            Experiences in the heart of the Tatras
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Chalet Matthe Lomnica is an ideal starting point for exploring the beauty
            of the High Tatras – regardless of the season. It is up to you whether you
            set off on foot, by car or rent one of the electric bikes available to
            guests.
          </p>
          <button className="bg-[#4a3f35] text-white px-10 py-4 rounded-lg hover:bg-[#5a4f45] transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg">
            Discover the surroundings of the Chalet
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