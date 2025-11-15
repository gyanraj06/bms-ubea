"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Plus,
  Trash,
  PencilSimple,
  Upload,
  X,
  Bed,
  Users,
  Ruler,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Room, Media } from "@/types";

type TabType = "rooms" | "media";

export default function PropertyMediaPage() {
  const [adminUserId, setAdminUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string>("Rooms");
  const [selectedRoomForUpload, setSelectedRoomForUpload] = useState<string>("");

  // Room form state
  const [roomForm, setRoomForm] = useState({
    room_number: "",
    room_type: "Deluxe",
    floor: 1,
    max_guests: 2,
    base_price: 2500,
    gst_percentage: 0,
    description: "",
    amenities: [] as string[],
    size_sqft: 250,
    bed_type: "Queen Bed",
    view_type: "Garden View",
    is_available: true,
    is_active: true,
  });

  const amenitiesList = [
    "Free WiFi",
    "Air Conditioning",
    "TV",
    "Mini Bar",
    "Hot Water",
    "Breakfast",
    "Room Service",
    "Balcony",
    "Work Desk",
    "Safe",
  ];

  const roomTypes = ["Deluxe", "Suite", "Premium", "Standard"];
  const bedTypes = ["Single Bed", "Queen Bed", "King Bed", "Twin Beds"];
  const viewTypes = ["Garden View", "Mountain View", "City View", "Pool View"];

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/admin/rooms");
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  // Fetch media
  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/admin/media");
      const data = await response.json();
      if (data.success) {
        setMedia(data.media);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  useEffect(() => {
    // Load admin user ID from localStorage
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setAdminUserId(user.id || "");
      } catch (error) {
        console.error("Error parsing admin user:", error);
      }
    }

    fetchRooms();
    fetchMedia();
  }, []);

  // Handle room creation/update
  const handleSaveRoom = async () => {
    if (!roomForm.room_number || !roomForm.room_type) {
      toast.error("Room number and type are required");
      return;
    }

    const method = editingRoom ? "PUT" : "POST";
    const body = editingRoom
      ? { id: editingRoom.id, ...roomForm }
      : roomForm;

    try {
      const response = await fetch("/api/admin/rooms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchRooms();
        handleCloseRoomModal();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to save room");
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(`/api/admin/rooms?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  // Handle image upload
  const handleUploadImages = async () => {
    if (uploadingFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (uploadCategory === "Rooms" && !selectedRoomForUpload) {
      toast.error("Please select a room for these images");
      return;
    }

    if (!adminUserId) {
      toast.error("Admin user not found. Please login again.");
      return;
    }

    const uploadPromises = uploadingFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      formData.append("uploaded_by", adminUserId);
      if (selectedRoomForUpload) {
        formData.append("room_id", selectedRoomForUpload);
      }

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully`);
        fetchMedia();
        fetchRooms(); // Refresh rooms to show new images
        handleCloseUploadModal();
      } else {
        toast.error("Failed to upload images");
      }
    } catch (error) {
      toast.error("Failed to upload images");
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchMedia();
        fetchRooms(); // Refresh rooms to update images
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to delete media");
    }
  };

  const handleOpenRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        room_number: room.room_number,
        room_type: room.room_type,
        floor: room.floor,
        max_guests: room.max_guests,
        base_price: room.base_price,
        gst_percentage: room.gst_percentage || 0,
        description: room.description,
        amenities: room.amenities,
        size_sqft: room.size_sqft,
        bed_type: room.bed_type,
        view_type: room.view_type,
        is_available: room.is_available,
        is_active: room.is_active,
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        room_number: "",
        room_type: "Deluxe",
        floor: 1,
        max_guests: 2,
        base_price: 2500,
        gst_percentage: 0,
        description: "",
        amenities: [],
        size_sqft: 250,
        bed_type: "Queen Bed",
        view_type: "Garden View",
        is_available: true,
        is_active: true,
      });
    }
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadingFiles([]);
    setUploadCategory("Rooms");
    setSelectedRoomForUpload("");
  };

  const toggleAmenity = (amenity: string) => {
    setRoomForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Property & Media Management
        </h1>
        <p className="text-gray-600">
          Manage your property rooms and media gallery
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("rooms")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === "rooms"
              ? "text-brown-dark"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Rooms ({rooms.length})
          {activeTab === "rooms" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-dark"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === "media"
              ? "text-brown-dark"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Media Gallery ({media.length})
          {activeTab === "media" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-dark"
            />
          )}
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === "rooms" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add and manage property rooms
              </p>
            </div>
            <Button
              onClick={() => handleOpenRoomModal()}
              className="bg-brown-dark hover:bg-brown-medium text-white"
            >
              <Plus size={20} className="mr-2" />
              Add Room
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Bed size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rooms yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first room
              </p>
              <Button
                onClick={() => handleOpenRoomModal()}
                className="bg-brown-dark hover:bg-brown-medium text-white"
              >
                <Plus size={20} className="mr-2" />
                Add Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {/* Room Image */}
                  <div className="relative h-48 bg-gray-200">
                    {room.images && room.images.length > 0 && room.images[0] ? (
                      <img
                        src={room.images[0]}
                        alt={room.room_type}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show placeholder instead
                          if (target.parentElement) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full flex items-center justify-center absolute inset-0';
                            placeholder.innerHTML = '<svg width="48" height="48" viewBox="0 0 256 256" fill="currentColor" class="text-gray-400"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,152a12,12,0,1,1,12-12A12,12,0,0,1,72,152Zm136,56H48V48H208V208Z"/></svg>';
                            target.parentElement.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bed size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {room.is_available ? (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={14} weight="fill" />
                          Available
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <XCircle size={14} weight="fill" />
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {room.room_type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Room #{room.room_number}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-brown-dark">
                        ₹{room.base_price}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{room.max_guests} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Bed size={16} />
                        <span>{room.bed_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Ruler size={16} />
                        <span>{room.size_sqft} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Images size={16} />
                        <span>{room.images?.length || 0} Photos</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenRoomModal(room)}
                        variant="outline"
                        className="flex-1"
                      >
                        <PencilSimple size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteRoom(room.id)}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Media Gallery
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload and manage property images
              </p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-brown-dark hover:bg-brown-medium text-white"
            >
              <Upload size={20} className="mr-2" />
              Upload Images
            </Button>
          </div>

          {media.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Images size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media yet
              </h3>
              <p className="text-gray-500 mb-4">
                Upload images to showcase your property
              </p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-brown-dark hover:bg-brown-medium text-white"
              >
                <Upload size={20} className="mr-2" />
                Upload Images
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <Button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <Trash size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-white text-xs px-2 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Room Modal - Continue in next message due to length */}
      <AnimatePresence>
        {showRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseRoomModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRoom ? "Edit Room" : "Add New Room"}
                  </h2>
                  <button
                    onClick={handleCloseRoomModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Number */}
                  <div>
                    <Label htmlFor="room_number">
                      Room Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="room_number"
                      value={roomForm.room_number}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, room_number: e.target.value })
                      }
                      placeholder="e.g., 101"
                    />
                  </div>

                  {/* Room Type */}
                  <div>
                    <Label htmlFor="room_type">
                      Room Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="room_type"
                      value={roomForm.room_type}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, room_type: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                    >
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Floor */}
                  <div>
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={roomForm.floor}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })
                      }
                      min="1"
                    />
                  </div>

                  {/* Max Guests */}
                  <div>
                    <Label htmlFor="max_guests">Max Guests</Label>
                    <Input
                      id="max_guests"
                      type="number"
                      value={roomForm.max_guests}
                      onChange={(e) =>
                        setRoomForm({
                          ...roomForm,
                          max_guests: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>

                  {/* Base Price */}
                  <div>
                    <Label htmlFor="base_price">
                      Price per Night (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="base_price"
                      type="number"
                      value={roomForm.base_price}
                      onChange={(e) =>
                        setRoomForm({
                          ...roomForm,
                          base_price: parseFloat(e.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  {/* GST Percentage */}
                  <div>
                    <Label htmlFor="gst_percentage">
                      GST Percentage (%)
                    </Label>
                    <Input
                      id="gst_percentage"
                      type="number"
                      value={roomForm.gst_percentage}
                      onChange={(e) =>
                        setRoomForm({
                          ...roomForm,
                          gst_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <Label htmlFor="size_sqft">Size (sq ft)</Label>
                    <Input
                      id="size_sqft"
                      type="number"
                      value={roomForm.size_sqft}
                      onChange={(e) =>
                        setRoomForm({
                          ...roomForm,
                          size_sqft: parseInt(e.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  {/* Bed Type */}
                  <div>
                    <Label htmlFor="bed_type">Bed Type</Label>
                    <select
                      id="bed_type"
                      value={roomForm.bed_type}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, bed_type: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                    >
                      {bedTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Type */}
                  <div>
                    <Label htmlFor="view_type">View Type</Label>
                    <select
                      id="view_type"
                      value={roomForm.view_type}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, view_type: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                    >
                      {viewTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={roomForm.description}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                      placeholder="Describe the room..."
                    />
                  </div>

                  {/* Amenities */}
                  <div className="md:col-span-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {amenitiesList.map((amenity) => (
                        <label
                          key={amenity}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={roomForm.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="md:col-span-2 flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roomForm.is_available}
                        onChange={(e) =>
                          setRoomForm({ ...roomForm, is_available: e.target.checked })
                        }
                        className="rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                      />
                      <span className="text-sm font-medium">Available for Booking</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roomForm.is_active}
                        onChange={(e) =>
                          setRoomForm({ ...roomForm, is_active: e.target.checked })
                        }
                        className="rounded border-gray-300 text-brown-dark focus:ring-brown-dark"
                      />
                      <span className="text-sm font-medium">Active (Visible to customers)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button onClick={handleCloseRoomModal} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveRoom}
                    className="bg-brown-dark hover:bg-brown-medium text-white"
                  >
                    {editingRoom ? "Update Room" : "Create Room"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseUploadModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upload Images
                  </h2>
                  <button
                    onClick={handleCloseUploadModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category Select */}
                  <div>
                    <Label htmlFor="upload_category">Category</Label>
                    <select
                      id="upload_category"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                    >
                      <option value="Rooms">Rooms</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Events">Events</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Room Select (only for Rooms category) */}
                  {uploadCategory === "Rooms" && (
                    <div>
                      <Label htmlFor="room_select">Select Room</Label>
                      <select
                        id="room_select"
                        value={selectedRoomForUpload}
                        onChange={(e) => setSelectedRoomForUpload(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-dark"
                      >
                        <option value="">Choose a room...</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.room_type} - Room #{room.room_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* File Input */}
                  <div>
                    <Label htmlFor="file_upload">Select Images</Label>
                    <Input
                      id="file_upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadingFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    {uploadingFiles.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {uploadingFiles.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button onClick={handleCloseUploadModal} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadImages}
                    className="bg-brown-dark hover:bg-brown-medium text-white"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
