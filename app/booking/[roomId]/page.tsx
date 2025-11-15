"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Users,
  Bed,
  Check,
  WifiHigh,
  TelevisionSimple,
  Fan,
  Shower,
  Coffee,
  Car,
  ArrowLeft,
  CreditCard,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [formData, setFormData] = useState({
    // Guest Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // ID Proof (required in India)
    idType: "aadhaar",
    idNumber: "",
    // Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    // Special Requests
    specialRequests: "",
  });

  // Get booking details from URL params
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") || "2";
  const rooms = searchParams.get("rooms") || "1";

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Fetch room details from API
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoadingRoom(true);
        const response = await fetch('/api/rooms');
        const data = await response.json();

        if (data.success) {
          const foundRoom = data.rooms.find((r: any) => r.id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            toast.error('Room not found');
            router.push('/booking');
          }
        } else {
          toast.error('Failed to load room details');
          router.push('/booking');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load room details');
        router.push('/booking');
      } finally {
        setIsLoadingRoom(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

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

  // Calculate total nights and price
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) return { nights: 0, total: 0, tax: 0, grandTotal: 0, gstPercentage: 0 };

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomsCount = parseInt(rooms);
    const subtotal = room.base_price * nights * roomsCount;
    const gstPercentage = room.gst_percentage || 0; // Use room's GST or 0 if not set
    const tax = subtotal * (gstPercentage / 100);
    const grandTotal = subtotal + tax;

    return { nights, subtotal, tax, grandTotal, gstPercentage };
  };

  const { nights, subtotal, tax, grandTotal, gstPercentage } = calculateTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!formData.idNumber) {
      toast.error("Please provide ID proof details");
      return;
    }

    setIsProcessing(true);

    // Simulate booking - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success("Booking confirmed! Redirecting to payment...");

    // Redirect to payment or confirmation page
    setTimeout(() => {
      setIsProcessing(false);
      // router.push('/booking/confirmation');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with white background and dark text */}
      <ChaletHeader forceLight={true} />

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} weight="bold" />
          <span className="font-medium">Back to Rooms</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoadingRoom ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brown-dark mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Loading room details...</p>
            </div>
          </div>
        ) : !room ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
            <button
              onClick={() => router.push('/booking')}
              className="px-6 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors"
            >
              Back to Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Room Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Images */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
              {room.images && room.images.length > 0 && (
                <>
                  <div
                    className="relative h-96 cursor-pointer group bg-gray-100"
                    onClick={() => {
                      setSelectedImageIndex(0);
                      setShowImageModal(true);
                    }}
                  >
                    <Image
                      src={room.images[0]}
                      alt={room.room_type}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                      quality={75}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        Click to view
                      </span>
                    </div>
                  </div>
                  {room.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 p-4">
                      {room.images.slice(1, 4).map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100"
                          onClick={() => {
                            setSelectedImageIndex(idx + 1);
                            setShowImageModal(true);
                          }}
                        >
                          <Image
                            src={img}
                            alt={`${room.room_type} ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="200px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.room_type}</h1>
              <p className="text-sm text-gray-500 mb-2">Room #{room.room_number}</p>
              <p className="text-gray-600 mb-6">{room.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={20} weight="fill" className="text-primary-600" />
                  <span>Up to {room.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Bed size={20} weight="fill" className="text-primary-600" />
                  <span>{room.bed_type}</span>
                </div>
                {room.size_sqft > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-primary-600 font-semibold">{room.size_sqft} sq ft</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-2 text-gray-700">
                        <Icon size={18} weight="fill" className="text-green-600" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91"
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ID Proof */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Proof (Required)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idType">ID Type *</Label>
                      <select
                        id="idType"
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      >
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving">Driving License</option>
                        <option value="voter">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <input
                        type="text"
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all resize-none"
                    placeholder="Any special requirements or requests..."
                  />
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-gray-900">
                    {checkInDate ? format(checkInDate, "dd MMM yyyy") : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">
                    {checkOutDate ? format(checkOutDate, "dd MMM yyyy") : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">{guests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rooms</span>
                  <span className="font-medium text-gray-900">{rooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium text-gray-900">{nights}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Room × {nights} night(s) × {rooms}</span>
                  <span className="font-medium text-gray-900">₹{subtotal?.toLocaleString()}</span>
                </div>
                {gstPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST ({gstPercentage}%)</span>
                    <span className="font-medium text-gray-900">₹{tax?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-brown-dark">₹{grandTotal?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full h-12 px-6 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} weight="bold" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <div className="mt-6 space-y-2 text-xs text-gray-600">
                <p className="flex items-start gap-2">
                  <Check size={16} weight="bold" className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Free cancellation up to 24 hours before check-in</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check size={16} weight="bold" className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check size={16} weight="bold" className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure payment</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      {showImageModal && room && room.images && room.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close gallery"
          >
            <X size={32} weight="bold" />
          </button>

          {/* Navigation Buttons */}
          {room.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : room.images.length - 1));
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Previous image"
              >
                <CaretLeft size={48} weight="bold" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev < room.images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Next image"
              >
                <CaretRight size={48} weight="bold" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative w-full max-w-6xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={room.images[selectedImageIndex]}
              alt={`${room.room_type} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
            {selectedImageIndex + 1} / {room.images.length}
          </div>

          {/* Thumbnail Strip */}
          {room.images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {room.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(idx);
                  }}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all bg-gray-800",
                    selectedImageIndex === idx
                      ? "border-white scale-110"
                      : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      }
    >
      <BookingDetailContent />
    </Suspense>
  );
}
