export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  max_guests: number;
  base_price: number;
  gst_percentage: number;
  description: string;
  amenities: string[];
  size_sqft: number;
  bed_type: string;
  view_type: string;
  is_available: boolean;
  is_active: boolean;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Media {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  category: "Rooms" | "Facilities" | "Exterior" | "Events" | "Other";
  room_id?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  is_featured: boolean;
  display_order: number;
  uploaded_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface Hall {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  eventTypes: string[];
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface GuestDetail {
  name: string;
  age: number;
}

export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  // New enhanced fields
  bank_id_number?: string;
  govt_id_image_url?: string;
  bank_id_image_url?: string;
  booking_for?: "self" | "relative";
  guest_details?: GuestDetail[];
  needs_cot?: boolean;
  needs_extra_bed?: boolean;
  num_cots?: number;
  num_extra_beds?: number;
}

export interface SearchParams {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  roomType?: string;
}

export interface AvailabilityRequest {
  check_in: string; // ISO date format (YYYY-MM-DD)
  check_out: string; // ISO date format (YYYY-MM-DD)
  room_type?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  available_rooms: Room[];
  total_available: number;
  booked_room_ids: string[];
  total_booked: number;
  search_criteria: {
    check_in: string;
    check_out: string;
    nights: number;
    room_type: string;
  };
  message: string;
  error?: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  storage_path: string;
  width?: number;
  height?: number;
  created_at?: string;
  uploaded_by?: string;
}

export interface RoomBlock {
  id: string;
  room_id: string;
  start_date: string; // ISO date format (YYYY-MM-DD)
  end_date: string; // ISO date format (YYYY-MM-DD)
  reason: "Personal Booking" | "Maintenance" | "Renovation" | "Other";
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  rooms?: {
    room_number: string;
    room_type: string;
  };
}

export interface Payment {
  id: string;
  transaction_id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_type: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  gateway_response?: any;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  remarks?: string;
  processed_by?: string;
  processed_at?: string;
  created_at?: string;
}

export interface PaymentLog {
  id: string;
  payment_id?: string;
  booking_id?: string;
  event_type: "INITIATE" | "WEBHOOK" | "STATUS_CHECK" | "REDIRECT";
  request_payload?: any;
  response_payload?: any;
  status?: string;
  created_at?: string;
}
