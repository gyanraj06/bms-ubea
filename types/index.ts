export interface Room {
  id: string
  room_number: string
  room_type: string
  floor: number
  max_guests: number
  base_price: number
  gst_percentage: number
  description: string
  amenities: string[]
  size_sqft: number
  bed_type: string
  view_type: string
  is_available: boolean
  is_active: boolean
  images: string[]
  created_at?: string
  updated_at?: string
}

export interface Media {
  id: string
  file_name: string
  file_path: string
  file_url: string
  file_size: number
  file_type: string
  category: 'Rooms' | 'Facilities' | 'Exterior' | 'Events' | 'Other'
  room_id?: string
  title?: string
  description?: string
  alt_text?: string
  is_featured: boolean
  display_order: number
  uploaded_by: string
  created_at?: string
  updated_at?: string
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

export interface AvailabilityRequest {
  check_in: string // ISO date format (YYYY-MM-DD)
  check_out: string // ISO date format (YYYY-MM-DD)
  room_type?: string
}

export interface AvailabilityResponse {
  success: boolean
  available_rooms: Room[]
  total_available: number
  booked_room_ids: string[]
  total_booked: number
  search_criteria: {
    check_in: string
    check_out: string
    nights: number
    room_type: string
  }
  message: string
  error?: string
}
