"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ShoppingCart,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

import { useAuth } from "@/contexts/auth-context";

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<any>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const { user } = useAuth();

  // Cart Hook
  const { cart, updateCart, totalItems, subtotal } = useCart();

  // Get booking details from URL params
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") || "2";

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Fetch room details from API
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoadingRoom(true);
        const response = await fetch("/api/rooms");
        const data = await response.json();

        if (data.success) {
          const foundRoom = data.rooms.find((r: any) => r.id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            toast.error("Room not found");
            router.push("/booking");
          }
        } else {
          toast.error("Failed to load room details");
          router.push("/booking");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        toast.error("Failed to load room details");
        router.push("/booking");
      } finally {
        setIsLoadingRoom(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

  const amenityIcons: { [key: string]: any } = {
    WiFi: WifiHigh,
    AC: Fan,
    TV: TelevisionSimple,
    "Hot Water Rod": Shower,
    Shower: Shower,
    Breakfast: Coffee,
    "Room Service": Coffee,
    "Parking": Car,
    "Balcony": Check,
    "Work Desk": Check,
    "Safe": Check,
  };

  const quantityInCart = cart[roomId]?.quantity || 0;
  const maxAvailable = room?.count || 10; // Fallback if count not available

  // Calculate total price (including taxes)
  const calculateTotalWithTax = () => {
    // We need to fetch all room details for accurate tax calculation
    // For now, we rely on the price stored in cart + 12% assumption if GST missing
    // Ideally, we should fetch all room details or store GST in cart
    return Object.values(cart).reduce((total, item) => {
      const gstPercentage = 12; // Default assumption as we don't have room details for ALL cart items here easily without fetching
      const itemTotal = item.price * item.quantity;
      const tax = itemTotal * (gstPercentage / 100);
      return total + itemTotal + tax;
    }, 0);
  };

  const totalPriceWithTax = calculateTotalWithTax();

  const nights = checkInDate && checkOutDate
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleUpdateCart = (
    id: string,
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
    updateCart(id, delta, roomDetails);
  };

  const proceedToCheckout = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select dates first");
      return;
    }

    if (!user) {
      toast.error("Please login to proceed");
      router.push("/login");
      return;
    }

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
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
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
              <p className="text-lg font-medium text-gray-900">
                Loading room details...
              </p>
            </div>
          </div>
        ) : !room ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Room not found
            </h2>
            <button
              onClick={() => router.push("/booking")}
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
                          target.style.display = "none";
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
                        {room.images
                          .slice(1, 4)
                          .map((img: string, idx: number) => (
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
                                  target.style.display = "none";
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {room.room_type}
                </h1>
                <p className="text-sm text-gray-500 mb-2">
                  Room #{room.room_number}
                </p>
                <p className="text-gray-600 mb-6">{room.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users
                      size={20}
                      weight="fill"
                      className="text-primary-600"
                    />
                    <span>Up to {room.max_guests} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bed size={20} weight="fill" className="text-primary-600" />
                    <span>{room.bed_type}</span>
                  </div>

                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities.map((amenity: string) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 text-gray-700"
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
              </motion.div>
            </div>

            {/* Right Column - Pricing & Action */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{room.base_price.toLocaleString()}
                    <span className="text-base font-normal text-gray-600">/night</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">+ taxes & fees</p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Rooms
                  </label>
                  {quantityInCart > 0 ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-200">
                      <button
                        onClick={() => handleUpdateCart(roomId, -1)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <Minus size={20} weight="bold" />
                      </button>
                      <span className="font-bold text-2xl text-gray-900">{quantityInCart}</span>
                      <button
                        onClick={() => handleUpdateCart(roomId, 1, {
                          roomType: room.room_type,
                          price: room.base_price,
                          maxGuests: room.max_guests,
                          maxAvailable: maxAvailable
                        })}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 text-gray-700 transition-colors"
                        disabled={quantityInCart >= maxAvailable}
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateCart(roomId, 1, {
                        roomType: room.room_type,
                        price: room.base_price,
                        maxGuests: room.max_guests,
                        maxAvailable: maxAvailable
                      })}
                      className="w-full py-4 bg-brown-dark text-white rounded-xl font-semibold hover:bg-brown-medium transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus size={20} weight="bold" />
                      Add to Stay
                    </button>
                  )}
                </div>

                {/* Cart Summary (Mini) */}
                {totalItems > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Selection</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">{totalItems} Room{totalItems !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-gray-900">₹{(totalPriceWithTax * nights).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={proceedToCheckout}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Go to Checkout</span>
                      <ShoppingCart size={20} weight="bold" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && room && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-5xl w-full h-[80vh]">
              <Image
                src={room.images[selectedImageIndex]}
                alt={room.room_type}
                fill
                className="object-contain"
                quality={100}
              />
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
                onClick={() => setShowImageModal(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Checkout Bar (Mobile Only or Always) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 p-4 lg:hidden"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-brown-dark text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{(totalPriceWithTax * nights).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={proceedToCheckout}
                className="px-6 py-2 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md flex items-center gap-2 text-sm"
              >
                <span>Checkout</span>
                <ShoppingCart size={16} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <BookingDetailContent />
    </Suspense>
  );
}
