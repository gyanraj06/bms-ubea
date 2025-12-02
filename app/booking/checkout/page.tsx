"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  CreditCard,
  X,
  Trash,
  IdentificationCard,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import PhoneVerificationModal from "@/components/booking/PhoneVerificationModal";
import { useCart } from "@/hooks/use-cart";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Cart Hook
  const { cart, updateCart, totalItems, clearCart, isLoaded } = useCart();
  const selectedRooms = Object.values(cart);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    specialRequests: "",
    bookingFor: "self" as "self" | "relative",
  });

  // Guest Details
  const [guestDetails, setGuestDetails] = useState<Array<{ name: string; age: string }>>([]);
  
  // Phone Verification
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);

  // Parse URL params
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = parseInt(searchParams.get("guests") || "1");

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Check user login
  useEffect(() => {
    const checkUser = () => {
      const userDataStr = localStorage.getItem("userData");
      const sessionStr = localStorage.getItem("userSession");

      if (userDataStr && sessionStr && userDataStr !== "null" && sessionStr !== "null") {
        try {
          const userData = JSON.parse(userDataStr);
          const session = JSON.parse(sessionStr);
          setUser({ ...userData, token: session.access_token });
          
          // Pre-fill form if user data available
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || prev.firstName,
            lastName: userData.last_name || prev.lastName,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
          }));
          
          if (userData.phone) {
             setIsPhoneVerified(true);
             setVerifiedPhone(userData.phone);
          }

        } catch (error) {
          console.error("Error parsing user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // Initialize guest details
  useEffect(() => {
    if (isLoaded && selectedRooms.length > 0 && guestDetails.length === 0) {
      setGuestDetails([{ name: "", age: "" }]);
      setIsLoading(false);
    } else if (isLoaded && selectedRooms.length === 0) {
       setIsLoading(false);
    }
  }, [isLoaded, selectedRooms.length]);

  // Calculations
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0)
      return { nights: 0, subtotal: 0, tax: 0, grandTotal: 0 };

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let subtotal = 0;
    let tax = 0;

    selectedRooms.forEach(room => {
      const roomTotal = room.price * nights * room.quantity;
      subtotal += roomTotal;
      // Assume 12% tax if not available in cart item (which it isn't currently)
      // In a real app, we'd fetch fresh room details here or store tax info in cart
      const gstPercentage = 12; 
      tax += roomTotal * (gstPercentage / 100);
    });

    const grandTotal = subtotal + tax;

    return { nights, subtotal, tax, grandTotal };
  };

  const { nights, subtotal, tax, grandTotal } = calculateTotal();

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneVerified = (phone: string) => {
    setVerifiedPhone(phone);
    setIsPhoneVerified(true);
    setFormData({ ...formData, phone: phone.replace("+91", "") });
    toast.success("Phone verified!");
  };

  const handlePhoneChange = (value: string | undefined) => {
    const newPhone = value || "";
    setFormData({ ...formData, phone: newPhone });
    if (isPhoneVerified && newPhone !== verifiedPhone.replace("+91", "")) {
      setIsPhoneVerified(false);
      setVerifiedPhone("");
    }
  };

  // Guest Management
  const addGuest = () => {
    // Calculate total capacity
    const totalCapacity = selectedRooms.reduce((acc, room) => acc + (room.maxGuests * room.quantity), 0);
    
    if (guestDetails.length >= totalCapacity) {
      toast.error(`Maximum capacity reached (${totalCapacity} guests)`);
      return;
    }
    setGuestDetails([...guestDetails, { name: "", age: "" }]);
  };

  const removeGuest = (index: number) => {
    setGuestDetails(guestDetails.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: "name" | "age", value: string) => {
    const updated = [...guestDetails];
    updated[index][field] = value;
    setGuestDetails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book");
      router.push("/login");
      return;
    }

    if (!isPhoneVerified) {
      toast.error("Please verify your phone number");
      return;
    }

    // Basic validation
    if (guestDetails.some(g => !g.name || !g.age)) {
      toast.error("Please fill all guest details");
      return;
    }

    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please fill all address details");
      return;
    }

    if (!formData.idType || !formData.idNumber) {
      toast.error("Please provide ID proof details");
      return;
    }

    setIsProcessing(true);

    try {
      const sessionStr = localStorage.getItem("userSession");
      if (!sessionStr) throw new Error("No session");
      const session = JSON.parse(sessionStr);
      const token = session.access_token;

      // Prepare bookings payload
      const bookingsPayload = selectedRooms.map(room => ({
        room_id: room.roomId,
        quantity: room.quantity,
      }));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          check_in: checkInDate?.toISOString().split("T")[0],
          check_out: checkOutDate?.toISOString().split("T")[0],
          bookings: bookingsPayload,
          guest_details: guestDetails.map(g => ({ name: g.name, age: parseInt(g.age) })),
          special_requests: formData.specialRequests,
          booking_for: formData.bookingFor,
          num_guests: guestDetails.length,
          // Add extra fields to payload if API supports them, otherwise they might be ignored or need schema update
          // Assuming API can handle these or we pack them into special_requests or similar if needed
          // For now sending as top level fields, assuming API update or flexible schema
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          id_type: formData.idType,
          id_number: formData.idNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success("Booking initiated! Please complete payment.");
        clearCart(); // Clear cart after successful booking
        // Redirect to payment page for the first booking (or handle multiple)
        // For now, we assume one booking flow or redirect to the first one
        router.push(`/booking/payment/${data.booking_ids[0]}`);
      } else {
        toast.error(data.error || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brown-dark mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Initiated!</h2>
        <p className="text-gray-600">Redirecting to payment...</p>
      </main>
    );
  }

  if (selectedRooms.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <ChaletHeader forceLight={true} />
        <div className="h-20" />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={48} className="text-gray-400" weight="fill" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Looks like you haven't added any rooms to your stay yet. Explore our luxurious rooms and find your perfect getaway.
          </p>
          <button
            onClick={() => router.push("/booking")}
            className="px-8 py-3 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md"
          >
            Book Now
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} /> Back to Selection
          </button>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mt-4">Complete Your Booking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Guest Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h2>
              <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Booking For */}
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingFor"
                      value="self"
                      checked={formData.bookingFor === "self"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brown-dark focus:ring-brown-dark"
                    />
                    <span>Booking for Self</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingFor"
                      value="relative"
                      checked={formData.bookingFor === "relative"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brown-dark focus:ring-brown-dark"
                    />
                    <span>Booking for Someone Else</span>
                  </label>
                </div>

                {/* Personal Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between">
                      <span>Phone Number *</span>
                      {isPhoneVerified && <span className="text-green-600 text-xs">Verified</span>}
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <PhoneInput
                          defaultCountry="IN"
                          value={formData.phone.startsWith("+") ? formData.phone : `+91${formData.phone}`}
                          onChange={handlePhoneChange}
                          disabled={isPhoneVerified}
                          className="w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPhoneVerificationModal(true)}
                        disabled={isPhoneVerified || !formData.phone}
                        className={cn("px-3 py-2 rounded-lg text-sm font-medium", isPhoneVerified ? "bg-green-100 text-green-700" : "bg-brown-dark text-white")}
                      >
                        {isPhoneVerified ? "✓" : "Verify"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} /> Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ID Proof Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdentificationCard size={20} /> ID Proof
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idType">ID Type *</Label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none bg-white"
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                        <option value="voter_id">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Guest List */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Guest List</h3>
                    <button type="button" onClick={addGuest} className="text-sm text-brown-dark font-medium hover:underline">
                      + Add Guest
                    </button>
                  </div>
                  <div className="space-y-3">
                    {guestDetails.map((guest, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            placeholder="Name"
                            value={guest.name}
                            onChange={(e) => updateGuest(index, "name", e.target.value)}
                            className="h-10 px-3 rounded border border-gray-300"
                            required
                          />
                          <input
                            placeholder="Age"
                            type="number"
                            value={guest.age}
                            onChange={(e) => updateGuest(index, "age", e.target.value)}
                            className="h-10 px-3 rounded border border-gray-300"
                            required
                          />
                        </div>
                        {guestDetails.length > 1 && (
                          <button type="button" onClick={() => removeGuest(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <Label>Special Requests</Label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full p-3 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none"
                  />
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{checkInDate ? format(checkInDate, "dd MMM yyyy") : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{checkOutDate ? format(checkOutDate, "dd MMM yyyy") : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-900">Selected Rooms</h3>
                {selectedRooms.map((room, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{room.roomType}</span>
                      <span className="font-medium">₹{(room.price * room.quantity * nights).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateCart(room.roomId, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-50 text-gray-600 transition-all"
                        >
                          <Minus size={12} weight="bold" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center text-gray-900">{room.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCart(room.roomId, 1, {
                            roomType: room.roomType,
                            price: room.price,
                            maxGuests: room.maxGuests,
                            maxAvailable: room.maxAvailable
                          })}
                          disabled={room.quantity >= room.maxAvailable}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-50 text-gray-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Plus size={12} weight="bold" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => updateCart(room.roomId, -room.quantity)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Remove room"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brown-dark">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                disabled={isProcessing || !user}
                className="w-full h-12 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Processing..." : user ? "Proceed to QR Payment" : "Login to Book"}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <PhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        onVerified={handlePhoneVerified}
        initialPhone={formData.phone}
      />
      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
