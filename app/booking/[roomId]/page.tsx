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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import PhoneVerificationModal from "@/components/booking/PhoneVerificationModal";

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
  const [user, setUser] = useState<any>(null);
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
    bankIdNumber: "",
    bookingFor: "self" as "self" | "relative",
  });

  // New state for enhanced features
  const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
  const [bankIdFile, setBankIdFile] = useState<File | null>(null);
  const [govtIdPreview, setGovtIdPreview] = useState<string>("");
  const [bankIdPreview, setBankIdPreview] = useState<string>("");
  const [guestDetails, setGuestDetails] = useState<
    Array<{ name: string; age: string }>
  >([]);
  const [needsCot, setNeedsCot] = useState(false);
  const [needsExtraBed, setNeedsExtraBed] = useState(false);
  const [numCots, setNumCots] = useState(1);
  const [numExtraBeds, setNumExtraBeds] = useState(1);
  const [uploadingGovtId, setUploadingGovtId] = useState(false);
  const [uploadingBankId, setUploadingBankId] = useState(false);

  // Phone verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);

  // Get booking details from URL params
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") || "2";
  const rooms = searchParams.get("rooms") || "1";

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Check if user is logged in (don't redirect, just check)
  useEffect(() => {
    const checkUser = () => {
      const userDataStr = localStorage.getItem("userData");
      const sessionStr = localStorage.getItem("userSession");

      console.log("Checking user:", { userDataStr, sessionStr });

      if (
        userDataStr &&
        sessionStr &&
        userDataStr !== "null" &&
        sessionStr !== "null"
      ) {
        try {
          const userData = JSON.parse(userDataStr);
          const session = JSON.parse(sessionStr);
          setUser({ ...userData, token: session.access_token });
          console.log("User set:", userData);
        } catch (error) {
          console.error("Error parsing user:", error);
          setUser(null);
        }
      } else {
        console.log("No user or session found");
        setUser(null);
      }
    };

    // Check immediately
    checkUser();

    // Also check on storage events (when user logs in in another tab)
    window.addEventListener("storage", checkUser);

    return () => window.removeEventListener("storage", checkUser);
  }, []);

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
    "Hot Water": Shower,
    Shower: Shower,
    Breakfast: Coffee,
    "Mini Bar": Coffee,
    "Room Service": Coffee,
    Parking: Car,
    Balcony: Check,
    "Work Desk": Check,
    Safe: Check,
  };

  // Calculate total nights and price
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room)
      return { nights: 0, total: 0, tax: 0, grandTotal: 0, gstPercentage: 0 };

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const roomsCount = parseInt(rooms);
    const subtotal = room.base_price * nights * roomsCount;
    const gstPercentage = room.gst_percentage || 0; // Use room's GST or 0 if not set
    const tax = subtotal * (gstPercentage / 100);
    const grandTotal = subtotal + tax;

    return { nights, subtotal, tax, grandTotal, gstPercentage };
  };

  const { nights, subtotal, tax, grandTotal, gstPercentage } = calculateTotal();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection and preview
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "govt" | "bank"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP) or PDF");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Set file and create preview
    if (type === "govt") {
      setGovtIdFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setGovtIdPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setGovtIdPreview(""); // PDF - no preview
      }
    } else {
      setBankIdFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setBankIdPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setBankIdPreview(""); // PDF - no preview
      }
    }
  };

  // Upload document to server
  const uploadDocument = async (
    file: File,
    documentType: "govt_id" | "bank_id"
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch("/api/bookings/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.data.fileUrl;
      } else {
        toast.error(
          `Failed to upload ${
            documentType === "govt_id" ? "Government ID" : "Bank ID"
          }`
        );
        return null;
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      toast.error("File upload failed");
      return null;
    }
  };

  // Guest details management
  const addGuest = () => {
    const maxGuests = parseInt(guests);
    if (guestDetails.length >= maxGuests) {
      toast.error(
        `You can only add ${maxGuests} guest${
          maxGuests > 1 ? "s" : ""
        } as per your booking`
      );
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

  // Phone verification handlers
  const handlePhoneVerified = (phone: string) => {
    setVerifiedPhone(phone);
    setIsPhoneVerified(true);
    setFormData({ ...formData, phone: phone.replace("+91", "") });
    toast.success("Phone number verified successfully!");
  };

  const handlePhoneChange = (value: string | undefined) => {
    const newPhone = value || "";
    setFormData({ ...formData, phone: newPhone });

    // Clear verification if phone number changes
    if (isPhoneVerified && newPhone !== verifiedPhone.replace("+91", "")) {
      setIsPhoneVerified(false);
      setVerifiedPhone("");
      toast.info("Phone number changed. Please verify again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book a room");
      router.push("/login");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (!room) {
      toast.error("Room details not loaded");
      return;
    }

    // Phone verification check
    if (!isPhoneVerified) {
      toast.error("Please verify your phone number before booking");
      return;
    }

    // Validate phone number format
    const phoneToValidate = verifiedPhone || formData.phone;
    if (!phoneToValidate || !isValidPhoneNumber(phoneToValidate, "IN")) {
      toast.error("Please enter a valid Indian phone number");
      return;
    }

    // Validate guest details
    const maxGuests = parseInt(guests);
    if (guestDetails.length !== maxGuests) {
      toast.error(
        `Please add details for all ${maxGuests} guest${
          maxGuests > 1 ? "s" : ""
        }`
      );
      return;
    }

    // Validate all guest names and ages are filled
    const hasEmptyFields = guestDetails.some(
      (guest) => !guest.name.trim() || !guest.age.trim()
    );
    if (hasEmptyFields) {
      toast.error("Please fill in all guest names and ages");
      return;
    }

    // Validate ages are positive numbers
    const hasInvalidAge = guestDetails.some((guest) => {
      const age = parseInt(guest.age);
      return isNaN(age) || age <= 0 || age > 150;
    });
    if (hasInvalidAge) {
      toast.error("Please enter valid ages for all guests");
      return;
    }

    setIsProcessing(true);

    try {
      // Get user token from session
      const sessionStr = localStorage.getItem("userSession");
      if (!sessionStr) {
        toast.error("Please login to book a room");
        router.push("/login");
        setIsProcessing(false);
        return;
      }

      const session = JSON.parse(sessionStr);
      const token = session.access_token;

      if (!token) {
        toast.error("Please login to book a room");
        router.push("/login");
        setIsProcessing(false);
        return;
      }

      // Upload documents if provided
      let govtIdUrl: string | null = null;
      let bankIdUrl: string | null = null;

      if (govtIdFile) {
        setUploadingGovtId(true);
        govtIdUrl = await uploadDocument(govtIdFile, "govt_id");
        setUploadingGovtId(false);

        if (!govtIdUrl) {
          setIsProcessing(false);
          return;
        }
      }

      if (bankIdFile) {
        setUploadingBankId(true);
        bankIdUrl = await uploadDocument(bankIdFile, "bank_id");
        setUploadingBankId(false);

        if (!bankIdUrl) {
          setIsProcessing(false);
          return;
        }
      }

      // Prepare guest details for database
      const processedGuestDetails = guestDetails.map((guest) => ({
        name: guest.name.trim(),
        age: parseInt(guest.age),
      }));

      // Create booking via API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.id,
          check_in: checkInDate.toISOString().split("T")[0],
          check_out: checkOutDate.toISOString().split("T")[0],
          num_guests: parseInt(guests),
          num_adults: parseInt(guests),
          num_children: 0,
          special_requests: formData.specialRequests,
          advance_percentage: 100, // Full payment for now
          // New enhanced fields
          bank_id_number: formData.bankIdNumber || null,
          govt_id_image_url: govtIdUrl,
          bank_id_image_url: bankIdUrl,
          booking_for: formData.bookingFor,
          guest_details: processedGuestDetails,
          needs_cot: needsCot,
          needs_extra_bed: needsExtraBed,
          num_cots: needsCot ? numCots : 0,
          num_extra_beds: needsExtraBed ? numExtraBeds : 0,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Booking confirmed successfully!");

        // Redirect to success page
        setTimeout(() => {
          router.push(
            `/booking/success?bookingId=${data.booking.id}&bookingNumber=${data.booking_number}`
          );
        }, 1000);
      } else {
        toast.error(data.error || "Failed to create booking");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("An error occurred while creating your booking");
      setIsProcessing(false);
    }
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
                  {room.size_sqft > 0 && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-primary-600 font-semibold">
                        {room.size_sqft} sq ft
                      </span>
                    </div>
                  )}
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

              {/* Checkout Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Guest Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Personal Information
                    </h3>
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

                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                          <span>Phone Number *</span>
                          {isPhoneVerified && (
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                              <Check size={16} weight="bold" />
                              Verified
                            </span>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <PhoneInput
                              defaultCountry="IN"
                              countries={["IN"]}
                              value={formData.phone.startsWith("+") ? formData.phone : `+91${formData.phone}`}
                              onChange={handlePhoneChange}
                              placeholder="9876543210"
                              className="w-full"
                              disabled={isPhoneVerified}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPhoneVerificationModal(true)}
                            disabled={isPhoneVerified || !formData.phone}
                            className={cn(
                              "px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap",
                              isPhoneVerified
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-brown-dark text-white hover:bg-brown-dark/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            {isPhoneVerified ? "✓ Verified" : "Verify"}
                          </button>
                        </div>
                        {!isPhoneVerified && formData.phone && (
                          <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                            <span>⚠</span> Please verify your phone number to proceed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking For */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Who are you booking for?
                    </h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="bookingFor"
                          value="self"
                          checked={formData.bookingFor === "self"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-brown-dark focus:ring-brown-dark"
                        />
                        <span className="text-gray-700">Myself</span>
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
                        <span className="text-gray-700">Someone else</span>
                      </label>
                    </div>
                  </div>

                  {/* ID Proof */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ID Proof
                    </h3>
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

                    {/* Government ID Upload */}
                    <div className="mt-4">
                      <Label htmlFor="govtId">
                        Upload Government ID (Optional)
                      </Label>
                      <input
                        type="file"
                        id="govtId"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleFileSelect(e, "govt")}
                        className="mt-1 w-full"
                      />
                      {govtIdPreview && (
                        <div className="mt-2">
                          <img
                            src={govtIdPreview}
                            alt="Government ID Preview"
                            className="h-32 object-contain border rounded"
                          />
                        </div>
                      )}
                      {govtIdFile && !govtIdPreview && (
                        <p className="mt-2 text-sm text-gray-600">
                          PDF file selected: {govtIdFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank ID */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Bank Details
                    </h3>
                    <div>
                      <Label htmlFor="bankIdNumber">
                        Bank ID Number (Optional)
                      </Label>
                      <input
                        type="text"
                        id="bankIdNumber"
                        name="bankIdNumber"
                        value={formData.bankIdNumber}
                        onChange={handleInputChange}
                        placeholder="Bank account number or passbook number"
                        className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                      />
                    </div>

                    {/* Bank ID Upload */}
                    <div className="mt-4">
                      <Label htmlFor="bankId">
                        Upload Bank ID/Passbook (Optional)
                      </Label>
                      <input
                        type="file"
                        id="bankId"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleFileSelect(e, "bank")}
                        className="mt-1 w-full"
                      />
                      {bankIdPreview && (
                        <div className="mt-2">
                          <img
                            src={bankIdPreview}
                            alt="Bank ID Preview"
                            className="h-32 object-contain border rounded"
                          />
                        </div>
                      )}
                      {bankIdFile && !bankIdPreview && (
                        <p className="mt-2 text-sm text-gray-600">
                          PDF file selected: {bankIdFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Guest Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Guest Details
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add details for all {guests} guest
                      {parseInt(guests) > 1 ? "s" : ""} ({guestDetails.length}{" "}
                      of {guests} added)
                    </p>

                    <div className="space-y-3">
                      {guestDetails.map((guest, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`guestName${index}`}>
                                Guest {index + 1} Name *
                              </Label>
                              <input
                                type="text"
                                id={`guestName${index}`}
                                value={guest.name}
                                onChange={(e) =>
                                  updateGuest(index, "name", e.target.value)
                                }
                                required
                                placeholder="Full name"
                                className="mt-1 w-full h-10 px-3 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`guestAge${index}`}>Age *</Label>
                              <input
                                type="number"
                                id={`guestAge${index}`}
                                value={guest.age}
                                onChange={(e) =>
                                  updateGuest(index, "age", e.target.value)
                                }
                                required
                                min="1"
                                max="150"
                                placeholder="Age"
                                className="mt-1 w-full h-10 px-3 rounded-lg border-2 border-gray-300 focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGuest(index)}
                            className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove guest"
                          >
                            <X size={20} weight="bold" />
                          </button>
                        </div>
                      ))}

                      {guestDetails.length < parseInt(guests) && (
                        <button
                          type="button"
                          onClick={addGuest}
                          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brown-dark hover:text-brown-dark transition-colors"
                        >
                          + Add Guest Details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Requirements
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="needsCot"
                            checked={needsCot}
                            onChange={(e) => setNeedsCot(e.target.checked)}
                            className="w-4 h-4 text-brown-dark focus:ring-brown-dark rounded"
                          />
                          <Label htmlFor="needsCot" className="cursor-pointer">
                            Need Cot{" "}
                          </Label>
                        </div>
                        {needsCot && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor="numCots">Quantity:</Label>
                            <input
                              type="number"
                              id="numCots"
                              value={numCots}
                              onChange={(e) =>
                                setNumCots(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              min="1"
                              className="w-16 h-8 px-2 rounded border-2 border-gray-300 focus:border-brown-dark outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="needsExtraBed"
                            checked={needsExtraBed}
                            onChange={(e) => setNeedsExtraBed(e.target.checked)}
                            className="w-4 h-4 text-brown-dark focus:ring-brown-dark rounded"
                          />
                          <Label
                            htmlFor="needsExtraBed"
                            className="cursor-pointer"
                          >
                            Need Extra Bed
                          </Label>
                        </div>
                        {needsExtraBed && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor="numExtraBeds">Quantity:</Label>
                            <input
                              type="number"
                              id="numExtraBeds"
                              value={numExtraBeds}
                              onChange={(e) =>
                                setNumExtraBeds(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              min="1"
                              className="w-16 h-8 px-2 rounded border-2 border-gray-300 focus:border-brown-dark outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Address
                    </h3>
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
                    <Label htmlFor="specialRequests">
                      Special Requests (Optional)
                    </Label>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Booking Summary
                </h2>

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
                    <span className="text-gray-600">
                      Room × {nights} night(s) × {rooms}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{subtotal?.toLocaleString()}
                    </span>
                  </div>
                  {gstPercentage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        GST ({gstPercentage}%)
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{tax?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-brown-dark">
                      ₹{grandTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      Please login to complete your booking
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/login?redirect=${encodeURIComponent(
                            `/booking/${roomId}?${searchParams.toString()}`
                          )}`
                        )
                      }
                      className="mt-2 text-sm text-yellow-900 underline font-semibold"
                    >
                      Login or Sign up
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={
                    isProcessing || uploadingGovtId || uploadingBankId || !user
                  }
                  className="w-full h-12 px-6 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingGovtId ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading Government ID...</span>
                    </>
                  ) : uploadingBankId ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading Bank ID...</span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} weight="bold" />
                      <span>
                        {user ? "Proceed to Payment" : "Login Required"}
                      </span>
                    </>
                  )}
                </button>

                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p className="flex items-start gap-2">
                    <Check
                      size={16}
                      weight="bold"
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      Free cancellation up to 24 hours before check-in
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check
                      size={16}
                      weight="bold"
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <span>Instant confirmation</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check
                      size={16}
                      weight="bold"
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
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
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : room.images.length - 1
                  );
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Previous image"
              >
                <CaretLeft size={48} weight="bold" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) =>
                    prev < room.images.length - 1 ? prev + 1 : 0
                  );
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
                target.style.display = "none";
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
                      target.style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Phone Verification Modal */}
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
