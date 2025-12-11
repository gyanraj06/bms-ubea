"use client";

// Force dynamic rendering - required for auth and searchParams on Vercel
export const dynamic = 'force-dynamic';

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
  ShieldCheck,
  Phone,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";

import { isValidPhoneNumber } from "libphonenumber-js";
import InlinePhoneVerification from "@/components/booking/InlinePhoneVerification";
import { useCart } from "@/hooks/use-cart";

import { useAuth } from "@/contexts/auth-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);


  const { user, session } = useAuth();

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
    bankIdNumber: "",
    bankAccountName: "",
    guestIdNumber: "",
    relation: "",
    permissionCode: "", // Added permission code
  });

  const [usePermissionCode, setUsePermissionCode] = useState(false);
  const [isPermissionVerified, setIsPermissionVerified] = useState(false);

  // Guest Details
  const [guestDetails, setGuestDetails] = useState<Array<{ name: string; age: string }>>([]);

  // Phone Verification
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Extended Room Details (Images, etc.)
  const [roomDetailsMap, setRoomDetailsMap] = useState<Record<string, any>>({});

  // UBEA Member Discount
  const [isUbeaMember, setIsUbeaMember] = useState(false);

  // New State for Files & Extras
  const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
  const [bankIdFile, setBankIdFile] = useState<File | null>(null);
  const [guestIdFile, setGuestIdFile] = useState<File | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'govt' | 'bank' | 'guest') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'govt') setGovtIdFile(e.target.files[0]);
      else if (type === 'bank') setBankIdFile(e.target.files[0]);
      else if (type === 'guest') setGuestIdFile(e.target.files[0]);
    }
  };

  const uploadDocument = async (file: File, type: 'govt_id' | 'bank_id' | 'guest_id', authToken?: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', type);

      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log(`[Checkout] Starting upload for ${type}`, { fileSize: file.size, fileName: file.name });

      const res = await fetch('/api/bookings/upload-document', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      return data.data.filePath;
    } catch (error) {
      console.error(`[Checkout] Upload error details for ${type}:`, error);
      throw error;
    }
  };

  // Parse URL params
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = parseInt(searchParams.get("guests") || "1");

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Fetch full room details (images, etc)
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (selectedRooms.length === 0) return;

      try {
        // Fetch all rooms and filter (or optimize API to fetch by IDs if available)
        // For now, fetching all active rooms is acceptable as the list is small
        const res = await fetch("/api/rooms");
        const data = await res.json();

        if (data.success && data.rooms) {
          const details: Record<string, any> = {};
          data.rooms.forEach((room: any) => {
            details[room.id] = room;
          });
          setRoomDetailsMap(details);
        }
      } catch (error) {
        console.error("Failed to fetch room details", error);
      }
    };

    if (isLoaded && selectedRooms.length > 0) {
      fetchRoomDetails();
    }
  }, [isLoaded, selectedRooms.length]);

  // Check user login and pre-fill data
  useEffect(() => {
    // START DEBUG BYPASS RE-ENABLED
    const currentUser = user;

    console.log("[Checkout] Syncing user data. Current User:", currentUser);

    if (currentUser) {
      setFormData(prev => {
        let phone = currentUser.phone || prev.phone;
        // Ensure phone is E.164 formatted (e.g. +91...) to valid react-phone-number-input error
        if (phone && !phone.startsWith('+') && /^\d{10}$/.test(phone)) {
          phone = `+91${phone}`;
        }

        return {
          ...prev,
          firstName: currentUser.full_name?.split(' ')[0] || prev.firstName,
          lastName: currentUser.full_name?.split(' ').slice(1).join(' ') || prev.lastName,
          email: currentUser.email || prev.email,
          phone: phone,
        };
      });
      // STRICT REQUIREMENT: Do not auto-verify phone from profile. 
      // User must verify via inline OTP always, as requested.
      // setIsPhoneVerified(true); 
    }
  }, [user]);

  // Initialize guest details based on search params
  useEffect(() => {
    if (isLoaded && guestDetails.length === 0) {
      // Initialize with exact number of guests from search params
      const numberOfGuests = parseInt(String(guests || "1"), 10);
      const initialGuests = Array(numberOfGuests).fill(null).map(() => ({ name: "", age: "" }));
      setGuestDetails(initialGuests);
      setIsLoading(false);
    }
  }, [isLoaded, guests]);

  // Calculations
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0)
      return { nights: 0, subtotal: 0, grandTotal: 0, discount: 0 };

    // Calculate nights as 24-hour slots
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let subtotal = 0;
    let totalRoomsCount = 0;

    selectedRooms.forEach(room => {
      const roomTotal = room.price * nights * room.quantity;
      subtotal += roomTotal;
      totalRoomsCount += room.quantity;
    });

    const discountPerNightPerRoom = 100;
    const discount = isUbeaMember ? (discountPerNightPerRoom * totalRoomsCount * nights) : 0;
    const grandTotal = Math.max(0, subtotal - discount);

    return { nights, subtotal, grandTotal, discount };
  };

  const { nights, subtotal, grandTotal, discount } = calculateTotal();

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    console.log("[Checkout] handlePhoneChange:", value);
    setFormData(prev => ({ ...prev, phone: value }));
    setIsPhoneVerified(false); // Reset verification when number changes
  };

  // Guest Management
  const addGuest = () => {
    toast.info("To add more guests, please update your search criteria on the home page.");
  };

  const removeGuest = (index: number) => {
    setGuestDetails(guestDetails.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: "name" | "age", value: string) => {
    const updated = [...guestDetails];
    updated[index][field] = value;
    setGuestDetails(updated);
  };

  const verifyPermissionCode = async () => {
    if (!formData.permissionCode) {
      toast.error("Please enter permission code");
      return;
    }

    try {
      const verifyRes = await fetch('/api/bookings/verify-permission-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.permissionCode })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success || !verifyData.valid) {
        toast.error("Invalid Permission Code");
        setIsPermissionVerified(false);
        return;
      }

      setIsPermissionVerified(true);
      toast.success("Permission Code Verified ✅");
    } catch (err) {
      console.error("Verification error", err);
      toast.error("Error verifying code");
      setIsPermissionVerified(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!isProcessing) setIsProcessing(true);
    toast.info("Processing your booking...");

    if (!user) {
      setIsProcessing(false);
      toast.error("Please login to book");
      router.push("/login");
      return;
    }

    if (!isPhoneVerified) {
      console.log("[BOOKING DEBUG] ❌ FAILED: Phone not verified");
      setIsProcessing(false);
      toast.error("Please verify your phone number first");
      // Scroll to phone field
      const phoneField = document.querySelector('input[type="tel"]');
      if (phoneField) phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    console.log("[BOOKING DEBUG] ✅ Phone verified");

    // Strict Permission Code Verification Check
    if (usePermissionCode && !isPermissionVerified) {
      console.log("[BOOKING DEBUG] ❌ FAILED: Permission Code not verified");
      setIsProcessing(false);
      toast.error("Please verify your permission code before proceeding");
      const permField = document.querySelector('input[name="permissionCode"]');
      if (permField) permField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validation
    const newErrors: Record<string, string> = {};

    // 1. Personal Details
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

    // Phone validation (already verified but check existence)
    if (!formData.phone) newErrors.phone = "Phone number is required";

    // 2. Address Details
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

    // 3. ID Proof Validation
    if (!formData.idType) newErrors.idType = "ID Type is required";
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID Number is required";

    if (formData.idType === 'aadhaar') {
      if (!/^\d{12}$/.test(formData.idNumber)) {
        newErrors.idNumber = "Aadhaar must be exactly 12 digits";
      }
    }

    if (!govtIdFile) {
      newErrors.govtIdFile = "Government ID file is required";
      // toast.error("Please upload Government ID"); // relying on inline error now
    }

    // Permission Code / Employee ID Validation
    if (usePermissionCode) {
      if (!isPermissionVerified) {
        newErrors.permissionCode = "Please verify your permission code";
      }
    } else {
      if (!formData.bankIdNumber?.trim()) {
        newErrors.bankIdNumber = "Employee ID is required";
      }
      if (!bankIdFile) {
        newErrors.bankIdFile = "Employee ID file is required";
      }
    }

    // 4. Guest Details Validation
    // 4. Guest Details Validation
    guestDetails.forEach((guest, index) => {
      if (!guest.name.trim()) {
        newErrors[`guest_${index}_name`] = "Name is required";
      }
      if (!guest.age || isNaN(Number(guest.age))) {
        newErrors[`guest_${index}_age`] = "Age is required";
      }
    });

    if (Object.keys(newErrors).some(k => k.startsWith('guest_'))) {
      toast.error("Please fill all guest details");
    }

    // 5. Booking For Others Validation
    if (formData.bookingFor === 'relative') {
      if (!formData.guestIdNumber) newErrors.guestIdNumber = "Guest ID Number is required";
      else if (!/^\d{12}$/.test(formData.guestIdNumber)) newErrors.guestIdNumber = "Guest Aadhaar must be 12 digits";

      if (!formData.relation) newErrors.relation = "Relation is required";
      if (!guestIdFile) {
        newErrors.guestIdFile = "Guest ID file is required";
        toast.error("Please upload Guest ID");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("[BOOKING DEBUG] ❌ Validation Errors:", newErrors);
      setIsProcessing(false);
      toast.error("Please fix the errors highlighted in red");

      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return;
    }
    console.log("[BOOKING DEBUG] ✅ Field validation passed");
    console.log("[BOOKING DEBUG] ✅ ID type/number present");

    if (formData.idType === 'aadhaar' && !/^\d{12}$/.test(formData.idNumber)) {
      console.log("[BOOKING DEBUG] ❌ FAILED: Invalid Aadhaar format:", formData.idNumber);
      setIsProcessing(false);
      toast.error("Aadhaar Number must be exactly 12 digits");
      return;
    }
    console.log("[BOOKING DEBUG] ✅ ID format valid");

    // Guest ID Validation if booking for someone else
    if (formData.bookingFor === 'relative') {
      console.log("[BOOKING DEBUG] Checking guest ID (booking for relative)...");
      if (!formData.guestIdNumber || !/^\d{12}$/.test(formData.guestIdNumber)) {
        console.log("[BOOKING DEBUG] ❌ FAILED: Invalid guest Aadhaar:", formData.guestIdNumber);
        setIsProcessing(false);
        toast.error("Guest Aadhaar Number must be exactly 12 digits");
        return;
      }
      if (!guestIdFile) {
        console.log("[BOOKING DEBUG] ❌ FAILED: Missing guest ID file");
        setIsProcessing(false);
        toast.error("Please upload Guest Identity Proof");
        return;
      }

      if (!formData.relation) {
        console.log("[BOOKING DEBUG] ❌ FAILED: Missing relation");
        setIsProcessing(false);
        toast.error("Please enter your relation with the guest");
        return;
      }
      console.log("[BOOKING DEBUG] ✅ Guest ID valid");
    }

    // Validate file upload
    if (!govtIdFile) {
      console.log("[BOOKING DEBUG] ❌ FAILED: Missing Govt ID file");
      setIsProcessing(false);
      toast.error("Please upload your Government ID document");
      return;
    }
    console.log("[BOOKING DEBUG] ✅ All validations passed!");
    console.log("[BOOKING DEBUG] Starting API calls...");

    // Safety Timeout to prevent infinite spinner
    const safetyTimeout = setTimeout(() => {
      console.log("[BOOKING DEBUG] ⏰ TIMEOUT triggered after 45 seconds");
      if (isProcessing) {
        setIsProcessing(false);
        toast.error("Request timed out. Please try again.");
      }
    }, 45000);

    try {
      // Get auth token from context (already loaded, no hanging)
      console.log("[BOOKING DEBUG] Step 1: Getting auth token from context...");
      console.log("[BOOKING DEBUG] Session from context:", session ? "EXISTS" : "NULL");
      console.log("[BOOKING DEBUG] Session token:", session?.access_token ? "EXISTS" : "NULL");

      const authToken = session?.access_token;

      if (!authToken) {
        console.log("[BOOKING DEBUG] ❌ No auth token in context - user not logged in");
        toast.error("Please login to continue");
        setIsProcessing(false);
        clearTimeout(safetyTimeout);
        router.push("/login");
        return;
      }
      console.log("[BOOKING DEBUG] ✅ Auth token ready from context");

      // 1. Upload Documents
      let govtIdPath = null;
      let bankIdPath = null;
      let guestIdPath = null;

      if (govtIdFile) {
        try {
          console.log("[BOOKING DEBUG] Step 2: Uploading Govt ID...", govtIdFile.name, govtIdFile.size, "bytes");
          toast.info("Uploading Government ID...");
          const uploadStart = Date.now();
          govtIdPath = await uploadDocument(govtIdFile, 'govt_id', authToken);
          console.log("[BOOKING DEBUG] ✅ Govt ID uploaded in", Date.now() - uploadStart, "ms - Path:", govtIdPath);
        } catch (err) {
          console.log("[BOOKING DEBUG] ❌ Govt ID upload FAILED:", err);
          toast.error("Failed to upload Govt ID");
          setIsProcessing(false);
          clearTimeout(safetyTimeout);
          return;
        }
      }

      if (usePermissionCode) {
        if (!isPermissionVerified) {
          console.log("[BOOKING DEBUG] ❌ FAILED: Permission Code not verified");
          setIsProcessing(false);
          toast.error("Please verify your permission code");
          return;
        }
      } else {
        if (bankIdFile) {
          try {
            console.log("[BOOKING DEBUG] Step 3: Uploading Employee ID...", bankIdFile.name, bankIdFile.size, "bytes");
            toast.info("Uploading Employee ID...");
            const uploadStart = Date.now();
            bankIdPath = await uploadDocument(bankIdFile, 'bank_id', authToken);
            console.log("[BOOKING DEBUG] ✅ Employee ID uploaded in", Date.now() - uploadStart, "ms - Path:", bankIdPath);
          } catch (err) {
            console.log("[BOOKING DEBUG] ❌ Employee ID upload FAILED:", err);
            toast.error("Failed to upload Employee ID");
            setIsProcessing(false);
            clearTimeout(safetyTimeout);
            return;
          }
        }
      }

      if (formData.bookingFor === 'relative' && guestIdFile) {
        try {
          console.log("[BOOKING DEBUG] Step 4: Uploading Guest ID...", guestIdFile.name, guestIdFile.size, "bytes");
          toast.info("Uploading Guest ID...");
          const uploadStart = Date.now();
          guestIdPath = await uploadDocument(guestIdFile, 'guest_id', authToken);
          console.log("[BOOKING DEBUG] ✅ Guest ID uploaded in", Date.now() - uploadStart, "ms - Path:", guestIdPath);
        } catch (err) {
          console.log("[BOOKING DEBUG] ❌ Guest ID upload FAILED:", err);
          toast.error("Failed to upload Guest ID");
          setIsProcessing(false);
          clearTimeout(safetyTimeout);
          return;
        }
      }

      // Prepare bookings payload
      const bookingsPayload = selectedRooms.map(room => ({
        room_id: room.roomId,
        quantity: room.quantity,
      }));

      console.log("[BOOKING DEBUG] Step 5: Creating booking...");
      console.log("[BOOKING DEBUG] Payload:", JSON.stringify({
        check_in: checkInDate?.toISOString(),
        check_out: checkOutDate?.toISOString(),
        bookings: bookingsPayload,
        num_guests: guestDetails.length,
        govtIdPath, bankIdPath, guestIdPath
      }, null, 2));
      toast.info("Finalizing booking details...");

      const apiStartTime = Date.now();
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          check_in: checkInDate?.toISOString(),
          check_out: checkOutDate?.toISOString(),
          bookings: bookingsPayload,
          guest_details: guestDetails.map(g => ({ name: g.name, age: parseInt(g.age) || 0 })),
          special_requests: formData.specialRequests || '',
          booking_for: formData.bookingFor || 'self',
          num_guests: parseInt(String(guestDetails.length)) || 1,
          phone: formData.phone || '',
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          pincode: formData.pincode || '',
          email: formData.email || '', // Send email to API
          id_type: formData.idType || '',
          id_number: formData.idNumber || '',
          govt_id_image_url: govtIdPath || null,
          bank_id_number: formData.bankIdNumber || null,
          bank_id_image_url: bankIdPath || null,
          guest_id_number: formData.guestIdNumber || null,
          guest_id_image_url: guestIdPath || null,
          guest_relation: formData.relation || null,
          needs_cot: false,
          num_cots: 0,
          needs_extra_bed: false,
          num_extra_beds: 0,
          is_ubea_member: isUbeaMember,
          discount_amount: discount
        }),
      });

      console.log("[BOOKING DEBUG] API responded in", Date.now() - apiStartTime, "ms - Status:", response.status);
      const data = await response.json();
      console.log("[BOOKING DEBUG] API Response:", JSON.stringify(data, null, 2));

      clearTimeout(safetyTimeout);

      if (data.success) {
        console.log("[BOOKING DEBUG] ✅ SUCCESS! Booking IDs:", data.booking_ids);
        console.log("[BOOKING DEBUG] Redirecting to payment page...");
        setIsSuccess(true);
        toast.success("Booking initiated! Please complete payment.");
        clearCart(); // Clear cart after successful booking
        router.push(`/booking/payment/${data.booking_ids[0]}`);
      } else {
        console.log("[BOOKING DEBUG] ❌ API returned error:", data.error);
        console.log("[BOOKING DEBUG] Full error response:", JSON.stringify(data, null, 2));
        toast.dismiss();
        toast.error(data.error || "Booking failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.log("[BOOKING DEBUG] ❌ EXCEPTION caught:", error);
      console.log("[BOOKING DEBUG] Error stack:", (error as Error)?.stack);
      toast.dismiss();
      toast.error("An error occurred");
      setIsProcessing(false);
    }
    // finally block removed as setIsProcessing is handled in each path now to respect success state
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
                    <Label htmlFor="firstName">
                      {formData.bookingFor === 'self' ? 'First Name' : 'Booking Person First Name'} *
                    </Label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                    />
                    {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName}</span>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      {formData.bookingFor === 'self' ? 'Last Name' : 'Booking Person Last Name'} *
                    </Label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                    />
                    {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName}</span>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                  </div>
                  <div>
                    <InlinePhoneVerification
                      value={formData.phone}
                      onChange={(val) => handlePhoneChange(val)}
                      onVerifiedChange={(isVerified) => setIsPhoneVerified(isVerified)}
                    />
                    {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>}
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
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                      />
                      {errors.address && <span className="text-red-500 text-xs mt-1 block">{errors.address}</span>}
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                      />
                      {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city}</span>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                      />
                      {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state}</span>}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.pincode ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                      />
                      {errors.pincode && <span className="text-red-500 text-xs mt-1 block">{errors.pincode}</span>}
                    </div>
                  </div>
                </div>


                {/* ID Proof Section with Upload */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdentificationCard size={20} /> Identity Proof
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idType">ID Type *</Label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.idType ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none bg-white`}
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhaar">Aadhaar Card</option>
                      </select>
                      {errors.idType && <span className="text-red-500 text-xs mt-1 block">{errors.idType}</span>}
                    </div>
                    <div>
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={(e) => {
                          // Allow only numbers for Aadhaar
                          if (formData.idType === 'aadhaar') {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              handleInputChange(e);
                            }
                          } else {
                            handleInputChange(e);
                          }
                        }}
                        className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.idNumber ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                        maxLength={formData.idType === 'aadhaar' ? 12 : undefined}
                        placeholder={formData.idType === 'aadhaar' ? '12 digit Aadhaar Number' : ''}
                      />
                      {errors.idNumber && <span className="text-red-500 text-xs mt-1 block">{errors.idNumber}</span>}
                    </div>
                    <div className="md:col-span-2">
                      <Label>Upload ID Document (Image/PDF) *</Label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'govt')}
                        className={`mt-1 w-full p-2 border rounded-lg ${errors.govtIdFile ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      />
                      {errors.govtIdFile && <span className="text-red-500 text-xs mt-1 block">{errors.govtIdFile}</span>}
                      <p className="text-xs text-gray-500 mt-1">Please upload a clear copy of your Govt ID.</p>
                    </div>
                  </div>
                </div>

                {/* Employee ID / Permission Code Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} /> Employee ID / Permission Code
                  </h3>

                  {/* Selection Radios */}
                  <div className="flex gap-6 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", !usePermissionCode ? "border-brown-dark" : "border-gray-300 group-hover:border-brown-medium")}>
                        {!usePermissionCode && <div className="w-2.5 h-2.5 rounded-full bg-brown-dark" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        checked={!usePermissionCode}
                        onChange={() => setUsePermissionCode(false)}
                      />
                      <span className={cn("font-medium", !usePermissionCode ? "text-gray-900" : "text-gray-600")}>Employee ID</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", usePermissionCode ? "border-brown-dark" : "border-gray-300 group-hover:border-brown-medium")}>
                        {usePermissionCode && <div className="w-2.5 h-2.5 rounded-full bg-brown-dark" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        checked={usePermissionCode}
                        onChange={() => setUsePermissionCode(true)}
                      />
                      <span className={cn("font-medium", usePermissionCode ? "text-gray-900" : "text-gray-600")}>Permission Code</span>
                    </label>
                  </div>

                  {usePermissionCode ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">

                      <div className="mb-4">
                        <Label htmlFor="permissionCode">Enter Permission Code *</Label>
                        <div className="flex gap-3 mt-1">
                          <input
                            type="text"
                            name="permissionCode"
                            value={formData.permissionCode}
                            onChange={(e) => {
                              handleInputChange(e);
                              setIsPermissionVerified(false);
                            }}
                            placeholder="6 digit code"
                            className="flex-1 h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none font-mono tracking-widest text-lg"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={verifyPermissionCode}
                            disabled={!formData.permissionCode || isPermissionVerified}
                            className={cn(
                              "px-6 h-11 rounded-lg font-medium transition-colors whitespace-nowrap",
                              isPermissionVerified
                                ? "bg-green-600 text-white cursor-default"
                                : "bg-brown-dark text-white hover:bg-brown-medium"
                            )}
                          >
                            {isPermissionVerified ? "Verified ✓" : "Verify Code"}
                          </button>
                        </div>
                        {errors.permissionCode && <span className="text-red-500 text-xs mt-1 block">{errors.permissionCode}</span>}
                      </div>

                      <div className="text-xs text-gray-600">
                        <p>To get a code, please contact Admin at:</p>
                        <a href="tel:9827058059" className="font-bold text-brown-dark flex items-center gap-1 mt-1">
                          <Phone size={14} weight="fill" /> 9827058059
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Don't have employee details? You can use a Permission Code instead.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankIdNumber">Employee ID *</Label>
                          <input
                            type="text"
                            name="bankIdNumber"
                            value={formData.bankIdNumber}
                            onChange={handleInputChange}
                            placeholder="Account Number or UPI ID"
                            className={`mt-1 w-full h-11 px-4 rounded-lg border-2 ${errors.bankIdNumber ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                          />
                          {errors.bankIdNumber && <span className="text-red-500 text-xs mt-1 block">{errors.bankIdNumber}</span>}
                        </div>
                        <div>
                          <Label>Upload Employee ID Proof *</Label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange(e, 'bank')}
                            className={`mt-1 w-full p-2 border rounded-lg ${errors.bankIdFile ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                          {errors.bankIdFile && <span className="text-red-500 text-xs mt-1 block">{errors.bankIdFile}</span>}
                          <p className="text-xs text-gray-500 mt-1">.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guest Identity Proof Section (Only if Booking for Someone Else) */}
                {formData.bookingFor === 'relative' && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={20} /> Identity Proof for Guest (Aadhaar Only) *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guestIdNumber">Guest Aadhaar Number *</Label>
                        <input
                          type="text"
                          name="guestIdNumber"
                          value={formData.guestIdNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              handleInputChange(e);
                            }
                          }}
                          className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none bg-yellow-50"
                          maxLength={12}
                          placeholder="12 digit Aadhaar Number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="relation">Relation with Booking Person *</Label>
                        <input
                          type="text"
                          name="relation"
                          value={formData.relation}
                          onChange={handleInputChange}
                          className="mt-1 w-full h-11 px-4 rounded-lg border-2 border-gray-300 focus:border-brown-dark outline-none bg-yellow-50"
                          placeholder="e.g. Father, Mother, Friend"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Upload Guest Aadhaar (Image/PDF) *</Label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, 'guest')}
                          className="mt-1 w-full p-2 border border-blue-200 bg-blue-50 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Please upload a clear copy of Guest's Aadhaar.</p>
                      </div>
                    </div>
                  </div>
                )}



                {/* Guest List */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Guest List ({guestDetails.length} Guests)</h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Count matched to search
                    </div>
                  </div>
                  <div className="space-y-3">
                    {guestDetails.map((guest, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <input
                              placeholder="Name"
                              value={guest.name}
                              onChange={(e) => updateGuest(index, "name", e.target.value)}
                              className={`h-10 px-3 rounded border ${errors[`guest_${index}_name`] ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                              required
                            />
                            {errors[`guest_${index}_name`] && <span className="text-red-500 text-[10px] mt-1">{errors[`guest_${index}_name`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <input
                              placeholder="Age"
                              type="number"
                              value={guest.age}
                              onChange={(e) => updateGuest(index, "age", e.target.value)}
                              className={`h-10 px-3 rounded border ${errors[`guest_${index}_age`] ? 'border-red-500' : 'border-gray-300'} focus:border-brown-dark outline-none`}
                              required
                            />
                            {errors[`guest_${index}_age`] && <span className="text-red-500 text-[10px] mt-1">{errors[`guest_${index}_age`]}</span>}
                          </div>
                        </div>
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-right">{checkInDate ? formatDateTime(checkInDate) : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-right">{checkOutDate ? formatDateTime(checkOutDate) : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{guestDetails.length}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4 space-y-4">
                <h3 className="font-semibold text-sm text-gray-900">Selected Rooms</h3>
                {selectedRooms.map((room, idx) => {
                  const details = roomDetailsMap[room.roomId];
                  // Fallback for image if not yet loaded or missing
                  const roomImage = details?.images && details.images.length > 0 ? details.images[0] : null;

                  return (
                    <div key={idx} className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        {roomImage ? (
                          <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={roomImage}
                              alt={room.roomType}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400">
                            <Bed size={24} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{details?.room_type || room.roomType}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">Max Guests: {room.maxGuests}</p>
                          {details?.view_type && (
                            <p className="text-xs text-gray-500 line-clamp-1">{details.view_type} View</p>
                          )}
                          {/* RESTORED DETAILS */}
                          {details?.bed_type && <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1"><Bed size={12} />{details.bed_type}</p>}
                          {details?.amenities && details.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {details.amenities.slice(0, 3).map((am: string, i: number) => (
                                <span key={i} className="text-[10px] bg-white border border-gray-200 px-1 rounded text-gray-500">
                                  {am}
                                </span>
                              ))}
                              {details.amenities.length > 3 && <span className="text-[10px] text-gray-400">+{details.amenities.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                        <span className="text-gray-600">Price</span>
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
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors bg-white border border-gray-200 w-full">
                    <input
                      type="checkbox"
                      checked={isUbeaMember}
                      onChange={(e) => setIsUbeaMember(e.target.checked)}
                      className="w-5 h-5 text-brown-dark rounded focus:ring-brown-dark border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Are you a AIBEA MPCG member?</span>
                      <p className="text-xs text-gray-500"></p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                {isUbeaMember && (
                  <div className="flex justify-between mb-2 text-sm text-green-600">
                    <span>Member Discount (₹100 x {Object.values(roomDetailsMap).length > 0 ? selectedRooms.reduce((acc, r) => acc + r.quantity, 0) : 0} rooms x {nights} nights)</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brown-dark">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
                <p className="font-semibold mb-2">Terms and Conditions</p>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold">1. Cancellations & Refunds</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Full refund for cancellations made 3 days before check-in.</li>
                      <li>No refund for cancellations within 3 days of check-in.</li>
                      <li>Refunds are processed within 30 working days.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">2. Guest Identification</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Only valid Government ID must be uploaded.</li>
                      <li>Incorrect or misleading documents will lead to cancellation.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">3. Rules & Conduct</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>No alcohol is allowed on the premises.</li>
                      <li>Guests must maintain decorum and avoid disturbance.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">4. Property Damage</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Any damage to property or amenities will be chargeable to the guest.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">5. Management Rights</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Management may deny or cancel bookings for policy violations.</li>
                      <li>Unauthorised guests are not permitted.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                role="button"
                onClick={async (e) => {
                  console.log("Button clicked from UI", { isProcessing, hasUser: !!user });
                  if (isProcessing) return;

                  try {
                    await handleSubmit(e);
                  } catch (err) {
                    console.error("CRITICAL ERROR IN SUBMIT: " + String(err));
                    console.error(err);
                  }
                }}
                className={`w-full h-12 bg-brown-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer relative z-50 pointer-events-auto ${isProcessing ? 'opacity-50' : 'hover:bg-brown-medium'}`}
              >
                {isProcessing ? "Processing..." : user ? "Proceed to QR Payment" : "Login to Book"}
              </div>
            </div>
          </div>
        </div>
      </div>


      <Footer />
    </main >
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
