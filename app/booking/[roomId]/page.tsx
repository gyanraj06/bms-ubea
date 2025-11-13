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
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [isProcessing, setIsProcessing] = useState(false);
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

  // Mock room data - will be fetched from backend
  const roomTypes = [
    {
      id: "1",
      name: "Deluxe Room",
      description: "Spacious room with modern amenities and comfortable bedding",
      price: 2500,
      maxGuests: 2,
      size: "250 sq ft",
      bedType: "1 Queen Bed",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75",
      amenities: ["Free WiFi", "AC", "TV", "Hot Water", "Breakfast"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=75",
      ],
    },
    {
      id: "2",
      name: "Executive Suite",
      description: "Luxurious suite with separate living area and premium facilities",
      price: 4000,
      maxGuests: 3,
      size: "400 sq ft",
      bedType: "1 King Bed + Sofa",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=75",
      amenities: ["Free WiFi", "AC", "TV", "Hot Water", "Breakfast", "Mini Bar"],
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=75",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75",
      ],
    },
    {
      id: "3",
      name: "Family Room",
      description: "Perfect for families with extra space and multiple beds",
      price: 3500,
      maxGuests: 4,
      size: "350 sq ft",
      bedType: "2 Double Beds",
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75",
      amenities: ["Free WiFi", "AC", "TV", "Hot Water", "Breakfast"],
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=75",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75",
      ],
    },
    {
      id: "4",
      name: "Standard Room",
      description: "Comfortable and affordable room with essential amenities",
      price: 1800,
      maxGuests: 2,
      size: "200 sq ft",
      bedType: "1 Double Bed",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=75",
      amenities: ["Free WiFi", "AC", "TV", "Hot Water"],
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=75",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=75",
      ],
    },
  ];

  const room = roomTypes.find((r) => r.id === roomId);

  const amenityIcons: { [key: string]: any } = {
    "Free WiFi": WifiHigh,
    AC: Fan,
    TV: TelevisionSimple,
    "Hot Water": Shower,
    Breakfast: Coffee,
    "Mini Bar": Coffee,
    Parking: Car,
  };

  // Calculate total nights and price
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) return { nights: 0, total: 0, tax: 0, grandTotal: 0 };

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomsCount = parseInt(rooms);
    const subtotal = room.price * nights * roomsCount;
    const tax = subtotal * 0.12; // 12% GST
    const grandTotal = subtotal + tax;

    return { nights, subtotal, tax, grandTotal };
  };

  const { nights, subtotal, tax, grandTotal } = calculateTotal();

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

  if (!room) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h1>
          <Button onClick={() => router.push("/booking")}>Back to Rooms</Button>
        </div>
      </main>
    );
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Images */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="relative h-96">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  quality={75}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {room.images.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="relative h-24 rounded-lg overflow-hidden">
                    <Image src={img} alt={`${room.name} ${idx + 1}`} fill className="object-cover" sizes="200px" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <p className="text-gray-600 mb-6">{room.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={20} weight="fill" className="text-primary-600" />
                  <span>Up to {room.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Bed size={20} weight="fill" className="text-primary-600" />
                  <span>{room.bedType}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-primary-600 font-semibold">{room.size}</span>
                </div>
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (12%)</span>
                  <span className="font-medium text-gray-900">₹{tax?.toLocaleString()}</span>
                </div>
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
      </div>

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
