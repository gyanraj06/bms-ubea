"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    User,
    Money,
    Check,
    UploadSimple,
    PencilSimple,
    Trash
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Date Picker Components
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// -- Types --
interface Room {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
}

export default function NewAdminBookingPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // -- State: Dates & Rooms --
    const [checkIn, setCheckIn] = useState<Date>();
    const [checkOut, setCheckOut] = useState<Date>();
    const [checkInTime, setCheckInTime] = useState("12:00");
    const [checkOutTime, setCheckOutTime] = useState("11:00");
    const [isSpecialDiscount, setIsSpecialDiscount] = useState(false);

    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

    // -- State: Form Data (Aligned with Checkout) --
    const [formData, setFormData] = useState({
        // Primary Guest
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        numGuests: "1",
        address: "",
        city: "",
        state: "",
        pincode: "",
        idType: "Aadhar",
        idNumber: "",

        // Bank / Employee ID
        bankIdNumber: "",

        // Booking For
        bookingFor: "self", // self | relative
        guestRelation: "",
        guestIdNumber: "",

        // Misc
        specialRequests: ""
    });

    // -- Files --
    const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
    const [bankIdFile, setBankIdFile] = useState<File | null>(null);
    const [guestIdFile, setGuestIdFile] = useState<File | null>(null);

    // -- Helpers --
    const calculateTotal = () => {
        if (!checkIn || !checkOut || selectedRoomIds.length === 0) return 0;
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return 0;

        const rooms = availableRooms.filter(r => selectedRoomIds.includes(r.id));

        // If Discount Checked: Price is 0 RS per room per night (Free)
        const effectivePrice = isSpecialDiscount ? 0 : null;

        const baseTotal = rooms.reduce((sum, r) => sum + ((effectivePrice ?? r.base_price) * nights), 0);
        return baseTotal; // GST Removed as per request
    };

    const uploadDocument = async (file: File, type: string, token: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', type);

        const res = await fetch('/api/bookings/upload-document', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        // Return filePath for private storage (signed URLs will be generated when viewing)
        return data.data.filePath;
    };

    // -- Handlers --
    const handleCheckAvailability = async () => {
        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates");
            return;
        }

        setCheckingAvailability(true);
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Please login again");
                return;
            }

            // Use server-side API that bypasses RLS
            // Fix: Build datetime from local date components + time to avoid UTC offset shifting the date
            const buildLocalISO = (date: Date, time: string) => {
                const [h, m] = time.split(':').map(Number);
                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0);
                return d.toISOString();
            };

            const response = await fetch("/api/admin/rooms/availability", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    check_in: buildLocalISO(checkIn, checkInTime),
                    check_out: buildLocalISO(checkOut, checkOutTime),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.error || "Failed to check availability");
                return;
            }

            setAvailableRooms(data.rooms || []);
            if (data.rooms.length === 0) toast.warning("No rooms available for these dates");
            else toast.success(`${data.rooms.length} rooms available`);

        } catch (err) {
            console.error(err);
            toast.error("Failed to check availability");
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleCreateBooking = async () => {
        // Validate mandatory fields
        const missingFields: string[] = [];

        // Date & Time validation
        if (!checkIn) missingFields.push("Check-in Date");
        if (!checkInTime) missingFields.push("Check-in Time");
        if (!checkOut) missingFields.push("Check-out Date");
        if (!checkOutTime) missingFields.push("Check-out Time");

        // Room selection
        if (selectedRoomIds.length === 0) missingFields.push("At least one Room");

        // Guest details
        if (!formData.numGuests || formData.numGuests === "0") missingFields.push("Number of Guests");
        if (!formData.firstName.trim()) missingFields.push("First Name");
        if (!formData.lastName.trim()) missingFields.push("Last Name");
        // if (!formData.phone.trim()) missingFields.push("Phone Number");
        // if (!formData.email.trim()) missingFields.push("Email Address");

        // Government ID Proof
        // if (!formData.idType) missingFields.push("ID Type");
        // if (!formData.idNumber.trim()) missingFields.push("ID Number");
        // if (!govtIdFile) missingFields.push("Government ID Document Upload");

        // Bank / Employee ID - Optional
        // (No validation - these fields are optional)

        // Address
        // if (!formData.address.trim()) missingFields.push("Full Address");

        // Show error if any mandatory fields are missing
        if (missingFields.length > 0) {
            toast.error(`Please fill the following mandatory fields: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : ""}`);
            return;
        }

        setLoading(true);
        toast.loading("Creating Booking...");

        try {
            // Use adminToken from localStorage instead of supabase session
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("Authentication failed: No admin token found");
                router.push("/admin/login");
                return;
            }

            // 1. Upload Files
            let govtIdUrl = null;
            let bankIdUrl = null;
            let guestIdUrl = null;

            if (govtIdFile) govtIdUrl = await uploadDocument(govtIdFile, 'govt_id', token);
            if (bankIdFile) bankIdUrl = await uploadDocument(bankIdFile, 'bank_id', token);
            if (guestIdFile) guestIdUrl = await uploadDocument(guestIdFile, 'guest_id', token);

            // Combine Date + Time
            // Fix: Use local date components (year/month/day) + time to prevent UTC offset from shifting the date
            const [inHours, inMinutes] = checkInTime.split(':').map(Number);
            const checkInDateTime = new Date(checkIn!.getFullYear(), checkIn!.getMonth(), checkIn!.getDate(), inHours, inMinutes, 0, 0);

            const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
            const checkOutDateTime = new Date(checkOut!.getFullYear(), checkOut!.getMonth(), checkOut!.getDate(), outHours, outMinutes, 0, 0);

            const res = await fetch('/api/admin/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    check_in: checkInDateTime.toISOString(),
                    check_out: checkOutDateTime.toISOString(),
                    room_ids: selectedRoomIds,
                    num_guests: parseInt(formData.numGuests) || 1,
                    is_special_discount: isSpecialDiscount,
                    guest_details: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        id_type: formData.idType,
                        id_number: formData.idNumber,

                        // Extra Fields
                        bank_id_number: formData.bankIdNumber,
                        govt_id_image_url: govtIdUrl,
                        bank_id_image_url: bankIdUrl,

                        booking_for: formData.bookingFor,
                        guest_relation: formData.guestRelation,
                        guest_id_number: formData.guestIdNumber,
                        guest_id_image_url: guestIdUrl
                    },
                    special_requests: formData.specialRequests
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.dismiss();
                toast.success("Booking Created Successfully (Paid via Cash)");
                router.push('/admin/dashboard/bookings');
            } else {
                toast.dismiss();
                toast.error(data.error || "Booking failed");
            }
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Offline Booking</h1>
                    <p className="text-gray-500 text-sm">Create a new booking with full guest verification</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Steps */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Dates & Rooms */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brown-dark text-white text-xs">1</span>
                            Select Dates & Rooms
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-2">
                                <Label>Check-in Date <span className="text-red-500">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11",
                                                !checkIn && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkIn ? format(checkIn, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={checkIn}
                                            onSelect={setCheckIn}
                                            initialFocus
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Check-in Time <span className="text-red-500">*</span></Label>
                                <Input
                                    type="time"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="h-11 border-gray-300"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Check-out Date <span className="text-red-500">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11",
                                                !checkOut && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={checkOut}
                                            onSelect={setCheckOut}
                                            initialFocus
                                            disabled={(date) => {
                                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                if (checkIn) return date <= checkIn;
                                                return date < today;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Check-out Time <span className="text-red-500">*</span></Label>
                                <Input
                                    type="time"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    className="h-11 border-gray-300"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckAvailability}
                            disabled={checkingAvailability}
                            className="w-full md:w-auto bg-brown-dark hover:bg-brown-dark/90 text-white mt-4"
                        >
                            {checkingAvailability ? 'Checking...' : 'Check Availability'}
                        </Button>

                        {availableRooms.length > 0 && (
                            <div className="mt-4 space-y-2 border rounded-lg p-2 max-h-80 overflow-y-auto">
                                {availableRooms.map(room => (
                                    <label key={room.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoomIds.includes(room.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedRoomIds([...selectedRoomIds, room.id]);
                                                    else setSelectedRoomIds(selectedRoomIds.filter(id => id !== room.id));
                                                }}
                                                className="h-5 w-5 rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">Room {room.room_number}</p>
                                                <p className="text-xs text-gray-500">{room.room_type}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-900">{formatCurrency(room.base_price)}<span className="text-xs text-gray-500 font-normal">/night</span></p>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Guest Details */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-gray-900">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brown-dark text-white text-xs">2</span>
                            Guest Details
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Number of Guests <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.numGuests}
                                        onChange={e => setFormData({ ...formData, numGuests: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>First Name <span className="text-red-500">*</span></Label>
                                    <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name <span className="text-red-500">*</span></Label>
                                    <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="h-11" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-11" />
                                </div>
                            </div>

                            {/* ID Proof Section */}
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
                                <h4 className="font-medium text-sm text-gray-900">Government ID Proof</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ID Type</Label>
                                        <select
                                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            value={formData.idType}
                                            onChange={e => setFormData({ ...formData, idType: e.target.value })}
                                        >
                                            <option value="Aadhar">Aadhar Card</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Driving License">Driving License</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ID Number</Label>
                                        <Input value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} className="h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Upload ID Document</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            className="h-11 pt-2"
                                            onChange={(e) => setGovtIdFile(e.target.files?.[0] || null)}
                                        />
                                        {govtIdFile && <Check className="text-green-600" />}
                                    </div>
                                </div>
                            </div>

                            {/* Bank / Employee ID Section */}
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
                                <h4 className="font-medium text-sm text-gray-900">Employee / Bank ID Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bank / Employee ID Number</Label>
                                        <Input value={formData.bankIdNumber} onChange={e => setFormData({ ...formData, bankIdNumber: e.target.value })} className="h-11" placeholder="Optional" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Upload Employee ID</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                className="h-11 pt-2"
                                                onChange={(e) => setBankIdFile(e.target.files?.[0] || null)}
                                            />
                                            {bankIdFile && <Check className="text-green-600" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label>Full Address</Label>
                                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="h-11" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="h-11" />
                                </div>
                            </div>

                            {/* Booking For */}
                            <div className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-100">
                                <div className="flex items-center gap-6">
                                    <Label className="text-base">Booking For:</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="self"
                                            name="bookingFor"
                                            value="self"
                                            checked={formData.bookingFor === 'self'}
                                            onChange={() => setFormData({ ...formData, bookingFor: 'self' })}
                                            className="h-4 w-4 text-brown-dark"
                                        />
                                        <label htmlFor="self" className="text-sm font-medium">Self</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="relative"
                                            name="bookingFor"
                                            value="relative"
                                            checked={formData.bookingFor === 'relative'}
                                            onChange={() => setFormData({ ...formData, bookingFor: 'relative' })}
                                            className="h-4 w-4 text-brown-dark"
                                        />
                                        <label htmlFor="relative" className="text-sm font-medium">Relative / Other</label>
                                    </div>
                                </div>

                                {formData.bookingFor === 'relative' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label>Guest Relation</Label>
                                            <Input value={formData.guestRelation} onChange={e => setFormData({ ...formData, guestRelation: e.target.value })} className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Guest ID Number</Label>
                                            <Input value={formData.guestIdNumber} onChange={e => setFormData({ ...formData, guestIdNumber: e.target.value })} className="h-11" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Upload Guest ID</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    className="h-11 pt-2"
                                                    onChange={(e) => setGuestIdFile(e.target.files?.[0] || null)}
                                                />
                                                {guestIdFile && <Check className="text-green-600" />}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Special Requests / Notes</Label>
                                <Input value={formData.specialRequests} onChange={e => setFormData({ ...formData, specialRequests: e.target.value })} className="h-11" />
                            </div>

                        </div>

                    </div>
                </div>

                {/* Right Column: Summary & Submit */}
                <div className="h-fit space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
                            <Money className="text-brown-dark" size={20} />
                            Summary
                        </h3>

                        <div className="space-y-3 text-sm border-b pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Selected Rooms</span>
                                <span className="font-medium text-gray-900">{selectedRoomIds.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nights</span>
                                <span className="font-medium text-gray-900">
                                    {checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-gray-600 font-medium">Total Estimate</span>
                                <span className="font-bold text-2xl text-brown-dark">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t mt-4">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isSpecialDiscount}
                                    onChange={(e) => setIsSpecialDiscount(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Special Discount (Free)</p>
                                    <p className="text-xs text-gray-500">Override room rates to Free / 0 Rs per room</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mb-6 border border-yellow-100">
                        <div className="flex gap-2">
                            <Check className="w-5 h-5 shrink-0 text-yellow-600" weight="bold" />
                            <div>
                                <p className="font-bold mb-1">Payment: CASH</p>
                                <p className="opacity-90">Booking will be marked as <strong>Confirmed</strong> and <strong>Paid</strong> immediately.</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-base bg-brown-dark hover:bg-brown-dark/90 text-white shadow-lg shadow-brown-dark/20"
                        size="lg"
                        onClick={handleCreateBooking}
                        disabled={loading || selectedRoomIds.length === 0}
                    >
                        {loading ? 'Creating Booking...' : 'Create Booking'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
