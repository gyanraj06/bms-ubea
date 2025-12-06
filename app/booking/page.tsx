"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  ShoppingCart,
  Eye,
  Trash,
  CaretUp,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/auth-context";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use persistent cart hook
  const { cart, updateCart, totalItems, subtotal } = useCart();

  // Check user login
  const { user } = useAuth();
  // We used to have local state 'user' here, but now we use the one from useAuth directly.
  // To match the existing code's expectation of 'user' variable, we just use the one from useAuth.

  // Fetch available rooms from database with date filtering
  useEffect(() => {
    const fetchRooms = async () => {
      // Only fetch if dates are selected
      if (!checkInDate || !checkOutDate) {
        setAvailableRooms([]);
        return;
      }

      try {
        setIsLoadingRooms(true);

        const checkIn = checkInDate.toISOString().split('T')[0];
        const checkOut = checkOutDate.toISOString().split('T')[0];
        const url = `/api/rooms?check_in=${checkIn}&check_out=${checkOut}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setAvailableRooms(data.rooms || []);
          setAvailabilityMessage(data.message || 'Search completed');
          setLastUpdated(new Date());
        } else {
          setAvailableRooms([]);
          setAvailabilityMessage(data.message || 'No rooms available for selected dates');
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

    // Auto-refresh availability every 30 seconds to prevent stale data
    const refreshInterval = setInterval(fetchRooms, 30000);

    return () => clearInterval(refreshInterval);
  }, [checkInDate, checkOutDate]);

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
    setGuests(prev => Math.min(prev + 1, 20));
  };

  const decrementGuests = () => {
    setGuests(prev => Math.max(prev - 1, 1));
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
      setAvailabilityMessage("Please select check-in and check-out dates");
      setHasSearched(true);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Call availability check API
      const response = await fetch('/api/rooms/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_in: checkInDate.toISOString().split('T')[0],
          check_out: checkOutDate.toISOString().split('T')[0],
          num_guests: guests,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAvailableRooms(data.available_rooms || []);
        setAvailabilityMessage(data.message || 'Search completed');
      } else {
        setAvailableRooms([]);
        setAvailabilityMessage(data.message || 'No rooms available for selected dates');
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
      setAvailabilityMessage('Failed to search rooms. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateCart = (
    roomId: string,
    delta: number,
    roomDetails?: {
      roomType: string;
      price: number;
      maxGuests: number;
      maxAvailable: number;
    }
  ) => {
    if (!user) {
      toast.error("Please login to add rooms to your stay");
      router.push("/login");
      return;
    }
    updateCart(roomId, delta, roomDetails);
  };

  const proceedToCheckout = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select dates first");
      return;
    }

    if (!user) {
      toast.error("Please login to proceed");
      router.push("/login");
      return;
    }

    // Revalidate availability before proceeding
    toast.loading("Verifying room availability...", { id: "availability-check" });

    try {
      const response = await fetch('/api/rooms/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_in: checkInDate.toISOString().split('T')[0],
          check_out: checkOutDate.toISOString().split('T')[0],
          num_guests: guests,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.available_rooms) {
        toast.error("No rooms available for selected dates", { id: "availability-check" });
        // Refresh the room list
        setAvailableRooms([]);
        setAvailabilityMessage(data.message || 'No rooms available');
        return;
      }

      // Check if all rooms in cart are still available
      const availableRoomIds = data.available_rooms.map((r: any) => r.id);
      const unavailableRooms: string[] = [];

      for (const [roomId, item] of Object.entries(cart)) {
        // Count how many of this room type are available
        const room = availableRooms.find(r => r.id === roomId);
        if (!room) continue;

        const availableOfType = data.available_rooms.filter(
          (r: any) => r.room_type === room.room_type
        );

        if (availableOfType.length < item.quantity) {
          unavailableRooms.push(
            `${room.room_type} (requested: ${item.quantity}, available: ${availableOfType.length})`
          );
        }
      }

      if (unavailableRooms.length > 0) {
        toast.error(
          `Some rooms are no longer available:\n${unavailableRooms.join('\n')}`,
          { id: "availability-check", duration: 5000 }
        );
        // Update available rooms to reflect current state
        setAvailableRooms(data.available_rooms);
        return;
      }

      toast.success("All rooms are available!", { id: "availability-check" });

      // Build selection string: id1:qty,id2:qty
      const selection = Object.entries(cart)
        .map(([id, item]) => `${id}:${item.quantity}`)
        .join(',');

      const params = new URLSearchParams({
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: guests.toString(),
        selection,
      });

      router.push(`/booking/checkout?${params.toString()}`);
    } catch (error) {
      console.error('Availability check error:', error);
      toast.error("Failed to verify availability. Please try again.", { id: "availability-check" });
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Group rooms by type
  // Since the API returns individual rooms, we group them manually
  const groupedRooms = availableRooms.reduce((acc: any, room: any) => {
    if (!acc[room.room_type]) {
      acc[room.room_type] = {
        ...room,
        count: 0,
        ids: []
      };
    }
    acc[room.room_type].count++;
    acc[room.room_type].ids.push(room.id);
    return acc;
  }, {});

  const roomTypes = Object.values(groupedRooms);

  // Calculate total price (including taxes)
  const calculateTotalWithTax = () => {
    return Object.values(cart).reduce((total, item) => {
      // We need to find the room to get GST percentage if possible, or assume 12%
      // Since cart item might not have GST, we can try to find it in availableRooms if loaded
      const room = availableRooms.find(r => r.id === item.roomId);
      const gstPercentage = room?.gst_percentage || 12;
      const itemTotal = item.price * item.quantity;
      const tax = itemTotal * (gstPercentage / 100);
      return total + itemTotal + tax;
    }, 0);
  };

  const totalPriceWithTax = calculateTotalWithTax();

  const nights = checkInDate && checkOutDate
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const navigateToRoomDetails = (roomId: string) => {
    const params = new URLSearchParams();
    if (checkInDate) params.set('checkIn', checkInDate.toISOString());
    if (checkOutDate) params.set('checkOut', checkOutDate.toISOString());
    params.set('guests', guests.toString());

    router.push(`/booking/${roomId}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        disabled={guests >= 20}
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
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {format(lastUpdated, "h:mm:ss a")}
              <span className="ml-2 text-xs text-gray-400">(Auto-refreshes every 30s)</span>
            </p>
          )}
        </div>

        {/* Availability Message */}
        {hasSearched && availabilityMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className={cn(
              "max-w-3xl mx-auto px-6 py-4 rounded-lg border-2 text-center",
              availableRooms.length > 0
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-amber-50 border-amber-500 text-amber-800"
            )}>
              <div className="font-semibold text-lg whitespace-pre-line">
                {availabilityMessage}
              </div>
            </div>
          </motion.div>
        )}

        {/* Rooms List - Only show if dates are selected */}
        {!checkInDate || !checkOutDate ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <CalendarBlank size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Dates to View Rooms</h3>
            <p className="text-gray-500">Please select check-in and check-out dates to see available rooms and prices.</p>
          </div>
        ) : (
          !isLoadingRooms && roomTypes.length > 0 && (
            <div className="space-y-6">
              {roomTypes.map((room: any, index: number) => {
                const hasImage = room.images && room.images.length > 0;
                const roomImage = hasImage ? room.images[0] : null;

                const representativeId = room.id;
                const quantityInCart = cart[representativeId]?.quantity || 0;
                const maxAvailable = room.count;

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className={cn(
                      "grid gap-6",
                      hasImage ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                      {/* Room Image */}
                      {hasImage && (
                        <div className="relative h-64 lg:h-auto min-h-[256px] bg-gray-100 cursor-pointer" onClick={() => navigateToRoomDetails(room.id)}>
                          <Image
                            src={roomImage!}
                            alt={room.room_type}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                            {maxAvailable} Available
                          </div>
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center group">
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm flex items-center gap-2">
                              <Eye size={16} /> View Details
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Room Details */}
                      <div className={cn("p-6", hasImage && "lg:col-span-2")}>
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-brown-dark transition-colors" onClick={() => navigateToRoomDetails(room.id)}>
                                  {room.room_type}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                  {room.view_type && `${room.view_type} View`}
                                </p>
                                <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                              </div>
                            </div>

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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {room.amenities.slice(0, 6).map((amenity: string) => {
                                    const Icon = amenityIcons[amenity] || Check;
                                    return (
                                      <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                                        <Icon size={18} weight="fill" className="text-green-600" />
                                        <span>{amenity}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Price and Selection */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <div className="text-3xl font-bold text-gray-900">
                                ₹{room.base_price.toLocaleString()}
                                <span className="text-base font-normal text-gray-600">/night</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">+ taxes & fees</p>
                            </div>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => navigateToRoomDetails(room.id)}
                                className="px-4 py-2 text-brown-dark font-medium hover:bg-brown-dark/5 rounded-lg transition-colors"
                              >
                                View Details
                              </button>

                              {quantityInCart > 0 ? (
                                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                  <button
                                    onClick={() => handleUpdateCart(representativeId, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 text-gray-700"
                                  >
                                    <Minus size={16} weight="bold" />
                                  </button>
                                  <span className="font-bold text-lg w-4 text-center">{quantityInCart}</span>
                                  <button
                                    onClick={() => handleUpdateCart(representativeId, 1, {
                                      roomType: room.room_type,
                                      price: room.base_price,
                                      maxGuests: room.max_guests,
                                      maxAvailable: maxAvailable
                                    })}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 text-gray-700"
                                    disabled={quantityInCart >= maxAvailable}
                                  >
                                    <Plus size={16} weight="bold" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleUpdateCart(representativeId, 1, {
                                    roomType: room.room_type,
                                    price: room.base_price,
                                    maxGuests: room.max_guests,
                                    maxAvailable: maxAvailable
                                  })}
                                  className="px-6 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md"
                                >
                                  Add to Stay
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Floating Checkout Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 p-4"
          >
            <div className="container mx-auto flex items-center justify-between">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-all text-left group border border-transparent hover:border-gray-200 relative">
                    <div className="relative">
                      <div className="bg-brown-dark text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform z-10 relative">
                        {totalItems}
                      </div>
                      <div className="absolute inset-0 bg-brown-dark/30 rounded-full animate-ping z-0"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-brown-dark uppercase tracking-wide">View Cart</p>
                        <CaretUp size={16} weight="bold" className="text-brown-dark group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{(totalPriceWithTax * nights).toLocaleString()}
                        <span className="text-xs font-normal text-gray-500 ml-1">(incl. taxes)</span>
                      </p>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 shadow-xl border-gray-100" align="start" side="top" sideOffset={20}>
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-serif font-bold text-gray-900 flex items-center gap-2">
                      <ShoppingCart size={18} className="text-brown-dark" />
                      Your Selection
                    </h4>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                    {Object.values(cart).map((item) => (
                      <div key={item.roomId} className="flex items-start justify-between gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.roomType}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              ₹{item.price.toLocaleString()} x {item.quantity}
                            </span>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-sm font-medium text-brown-dark">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCart(item.roomId, -1);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <span className="text-sm font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCart(item.roomId, 1, {
                                  roomType: item.roomType,
                                  price: item.price,
                                  maxGuests: item.maxGuests,
                                  maxAvailable: item.maxAvailable
                                });
                              }}
                              disabled={item.quantity >= item.maxAvailable}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateCart(item.roomId, -item.quantity);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                            title="Remove item"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Subtotal (per night)</span>
                      <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {nights > 1 && (
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="text-gray-500">Total Nights</span>
                        <span className="font-medium text-gray-900">{nights}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total Estimate</span>
                      <span className="font-bold text-xl text-brown-dark">₹{(totalPriceWithTax * nights).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Final tax calculation will be done at checkout
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
              <button
                onClick={proceedToCheckout}
                className="px-8 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md flex items-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ShoppingCart size={20} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
