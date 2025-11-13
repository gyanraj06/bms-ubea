export interface Room {
  id: string
  name: string
  category: 'deluxe' | 'suite' | 'premium' | 'standard'
  description: string
  pricePerNight: number
  capacity: number
  size: number // in sq ft
  amenities: string[]
  images: string[]
  available: boolean
}

export interface Hall {
  id: string
  name: string
  description: string
  capacity: number
  pricePerHour: number
  pricePerDay: number
  eventTypes: string[]
  amenities: string[]
  images: string[]
  available: boolean
}

export interface Booking {
  id: string
  roomId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: Date
  checkOut: Date
  guests: number
  specialRequests?: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
}

export interface SearchParams {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  roomType?: string
}
