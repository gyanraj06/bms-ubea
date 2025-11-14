"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CalendarBlank,
  Users,
  Bed,
  Check,
  WifiHigh,
  TelevisionSimple,
  Fan,
  Shower,
  Coffee,
  Car,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Fetch available rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const response = await fetch('/api/rooms');
        const data = await response.json();

        if (data.success) {
          setAvailableRooms(data.rooms || []);
        } else {
          toast.error('Failed to load rooms');
          setAvailableRooms([]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms');
        setAvailableRooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  // Pre-fill dates from URL parameters
  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (checkIn) setCheckInDate(new Date(checkIn));
    if (checkOut) setCheckOutDate(new Date(checkOut));
  }, [searchParams]);

  // Auto-select checkout date when check-in is selected
  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckInDate(date);
    if (date) {
      // Automatically set checkout to next day
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
      // Close check-in popover and auto-open checkout
      setCheckInOpen(false);
      setTimeout(() => setCheckOutOpen(true), 150);
    }
  };

  // Guest increment/decrement handlers
  const incrementGuests = () => {
    setGuests(prev => Math.min(prev + 1, 10));
  };

  const decrementGuests = () => {
    setGuests(prev => Math.max(prev - 1, 1));
  };

  // Room increment/decrement handlers
  const incrementRooms = () => {
    setRooms(prev => Math.min(prev + 1, 4));
  };

  const decrementRooms = () => {
    setRooms(prev => Math.max(prev - 1, 1));
  };

  const amenityIcons: { [key: string]: any } = {
    "WiFi": WifiHigh,
    "AC": Fan,
    "TV": TelevisionSimple,
    "Hot Water": Shower,
    "Shower": Shower,
    "Breakfast": Coffee,
    "Mini Bar": Coffee,
    "Room Service": Coffee,
    "Parking": Car,
    "Balcony": Check,
    "Work Desk": Check,
    "Safe": Check,
  };

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    setIsSearching(true);
    // Simulate search - can be enhanced later with availability check
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSearching(false);
  };

  const handleBookRoom = (roomId: string) => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select dates first");
      return;
    }

    // Navigate to booking detail page with all parameters
    const params = new URLSearchParams({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      guests: guests.toString(),
      rooms: rooms.toString(),
    });

    router.push(`/booking/${roomId}?${params.toString()}`);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader />

      {/* Hero Section */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=75"
          alt="Hotel"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-black/50 z-[1]" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Book Your Stay
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Choose from our comfortable rooms and enjoy your perfect stay
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label className={cn(
                "text-sm font-medium transition-colors",
                checkInOpen ? "text-brown-dark" : "text-gray-700"
              )}>
                Check-in
              </Label>
              <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex h-11 w-full items-center justify-start rounded-lg border-2 bg-white px-4 py-2 text-sm font-medium transition-all",
                      checkInOpen
                        ? "border-brown-dark ring-2 ring-brown-dark/20 shadow-md"
                        : "border-gray-300 hover:border-gray-400",
                      !checkInDate && "text-gray-400"
                    )}
                  >
                    <CalendarBlank
                      size={20}
                      className={cn(
                        "mr-2 flex-shrink-0 transition-colors",
                        checkInOpen ? "text-brown-dark" : "text-gray-400"
                      )}
                    />
                    <span className="truncate">
                      {checkInDate ? format(checkInDate, "dd MMM yyyy") : "Select date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={handleCheckInSelect}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label className={cn(
                "text-sm font-medium transition-colors",
                checkOutOpen ? "text-brown-dark" : "text-gray-700"
              )}>
                Check-out
              </Label>
              <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex h-11 w-full items-center justify-start rounded-lg border-2 bg-white px-4 py-2 text-sm font-medium transition-all",
                      checkOutOpen
                        ? "border-brown-dark ring-2 ring-brown-dark/20 shadow-md"
                        : "border-gray-300 hover:border-gray-400",
                      !checkOutDate && "text-gray-400"
                    )}
                  >
                    <CalendarBlank
                      size={20}
                      className={cn(
                        "mr-2 flex-shrink-0 transition-colors",
                        checkOutOpen ? "text-brown-dark" : "text-gray-400"
                      )}
                    />
                    <span className="truncate">
                      {checkOutDate ? format(checkOutDate, "dd MMM yyyy") : "Select date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => {
                      setCheckOutDate(date);
                      setCheckOutOpen(false);
                    }}
                    disabled={(date) => isDateDisabled(date) || (checkInDate ? date <= checkInDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Guests
              </Label>
              <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex h-11 w-full items-center justify-start rounded-lg border-2 bg-white px-4 py-2 text-sm font-medium transition-all",
                      guestsOpen
                        ? "border-brown-dark ring-2 ring-brown-dark/20 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <Users
                      size={20}
                      className={cn(
                        "mr-2 flex-shrink-0 transition-colors",
                        guestsOpen ? "text-brown-dark" : "text-gray-400"
                      )}
                    />
                    <span className="truncate">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Number of Guests</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={decrementGuests}
                        disabled={guests <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-brown-dark hover:bg-brown-dark hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      >
                        <Minus size={20} weight="bold" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{guests}</span>
                      <button
                        onClick={incrementGuests}
                        disabled={guests >= 10}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-brown-dark hover:bg-brown-dark hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>
                    <button
                      onClick={() => setGuestsOpen(false)}
                      className="w-full h-9 px-4 bg-brown-dark text-white rounded-lg font-medium hover:bg-brown-medium transition-colors text-sm"
                    >
                      Done
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Rooms
              </Label>
              <Popover open={roomsOpen} onOpenChange={setRoomsOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex h-11 w-full items-center justify-start rounded-lg border-2 bg-white px-4 py-2 text-sm font-medium transition-all",
                      roomsOpen
                        ? "border-brown-dark ring-2 ring-brown-dark/20 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <Bed
                      size={20}
                      className={cn(
                        "mr-2 flex-shrink-0 transition-colors",
                        roomsOpen ? "text-brown-dark" : "text-gray-400"
                      )}
                    />
                    <span className="truncate">
                      {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Number of Rooms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={decrementRooms}
                        disabled={rooms <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-brown-dark hover:bg-brown-dark hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      >
                        <Minus size={20} weight="bold" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{rooms}</span>
                      <button
                        onClick={incrementRooms}
                        disabled={rooms >= 4}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-brown-dark hover:bg-brown-dark hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>
                    <button
                      onClick={() => setRoomsOpen(false)}
                      className="w-full h-9 px-4 bg-brown-dark text-white rounded-lg font-medium hover:bg-brown-medium transition-colors text-sm"
                    >
                      Done
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full h-11 px-6 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rooms Section */}
      <div className="container mx-auto px-4 pb-16 relative">
        {/* Loading Overlay */}
        {(isSearching || isLoadingRooms) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brown-dark mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900">
                {isLoadingRooms ? "Loading rooms..." : "Searching available rooms..."}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Rooms
          </h2>
          <p className="text-lg text-gray-600">
            Select your preferred room type for a comfortable stay
          </p>
        </div>

        {/* No Rooms Available Message */}
        {!isLoadingRooms && availableRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-tan-light rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Bed size={48} weight="fill" className="text-brown-dark" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Rooms Available
              </h3>
              <p className="text-gray-600 mb-6">
                We currently don't have any rooms available in the property. Please check back later or contact us for more information.
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        )}

        {/* Rooms List */}
        {!isLoadingRooms && availableRooms.length > 0 && (
          <div className="space-y-6">
            {availableRooms.map((room, index) => {
              // Get first image or use placeholder
              const roomImage = room.images && room.images.length > 0
                ? room.images[0]
                : "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75";

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Room Image */}
                    <div className="relative h-64 lg:h-auto min-h-[256px]">
                      <Image
                        src={roomImage}
                        alt={room.room_type}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        quality={75}
                      />
                      {!room.is_available && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                          Currently Unavailable
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="lg:col-span-2 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                {room.room_type}
                              </h3>
                              <p className="text-sm text-gray-500 mb-3">
                                Room #{room.room_number} {room.view_type && `• ${room.view_type}`}
                              </p>
                              <p className="text-gray-600 mb-4">{room.description}</p>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users size={18} weight="fill" className="text-brown-dark" />
                              <span>Up to {room.max_guests} guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bed size={18} weight="fill" className="text-brown-dark" />
                              <span>{room.bed_type}</span>
                            </div>
                            {room.size_sqft > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-brown-dark font-semibold">
                                  {room.size_sqft} sq ft
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Room Amenities
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {room.amenities.map((amenity: string) => {
                                  const Icon = amenityIcons[amenity] || Check;
                                  return (
                                    <div
                                      key={amenity}
                                      className="flex items-center gap-2 text-sm text-gray-700"
                                    >
                                      <Icon
                                        size={18}
                                        weight="fill"
                                        className="text-green-600"
                                      />
                                      <span>{amenity}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price and Book Button */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              ₹{room.base_price.toLocaleString()}
                              <span className="text-base font-normal text-gray-600">
                                /night
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              + taxes & fees
                            </p>
                          </div>
                          <button
                            onClick={() => handleBookRoom(room.id)}
                            disabled={!room.is_available}
                            className="px-8 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brown-dark"
                          >
                            {room.is_available ? 'Book Now' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Booking Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check size={18} weight="bold" className="text-green-600 mt-0.5" />
              <span>Check-in time: 11:00 AM | Check-out time: 10:00 AM</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} weight="bold" className="text-green-600 mt-0.5" />
              <span>Free cancellation up to 24 hours before check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} weight="bold" className="text-green-600 mt-0.5" />
              <span>Valid ID proof required at check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} weight="bold" className="text-green-600 mt-0.5" />
              <span>Payment can be made online or at the property</span>
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <BookingContent />
    </Suspense>
  );
}
