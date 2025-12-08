"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Bed, Check, WifiHigh, TelevisionSimple, Fan, Shower, Coffee, Car, Plus, Minus } from "@phosphor-icons/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  quantityInCart: number;
  onUpdateCart: (delta: number) => void;
  maxAvailable: number;
}

export default function RoomDetailsModal({
  isOpen,
  onClose,
  room,
  quantityInCart,
  onUpdateCart,
  maxAvailable,
}: RoomDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !room) return null;

  const amenityIcons: { [key: string]: any } = {
    "WiFi": WifiHigh,
    "AC": Fan,
    "TV": TelevisionSimple,
    "Hot Water Rod": Shower,
    "Shower": Shower,
    "Breakfast": Coffee,
    "Room Service": Coffee,
    "Parking": Car,
    "Balcony": Check,
    "Work Desk": Check,
    "Safe": Check,
  };

  const images = room.images && room.images.length > 0 ? room.images : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-900 z-10 transition-colors shadow-sm"
          >
            <X size={24} />
          </button>

          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="relative h-64 md:h-96 bg-gray-100">
                <Image
                  src={images[currentImageIndex]}
                  alt={room.room_type}
                  fill
                  className="object-cover"
                />

                {/* Image Navigation Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentImageIndex === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{room.room_type}</h2>
                  <p className="text-gray-600">{room.view_type && `${room.view_type} View`}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-brown-dark">
                    ₹{room.base_price.toLocaleString()}
                    <span className="text-base font-normal text-gray-600">/night</span>
                  </div>
                  <p className="text-sm text-gray-500">+ taxes & fees</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Users size={20} className="text-brown-dark" />
                  <span className="font-medium">{room.max_guests} Guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Bed size={20} className="text-brown-dark" />
                  <span className="font-medium">{room.bed_type}</span>
                </div>
                {room.size_sqft > 0 && (
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    <span className="text-brown-dark font-bold">Sq</span>
                    <span className="font-medium">{room.size_sqft} sq ft</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none text-gray-600 mb-8">
                <p>{room.description}</p>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                    {room.amenities.map((amenity: string) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <div key={amenity} className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Icon size={16} weight="fill" className="text-green-600" />
                          </div>
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {maxAvailable} rooms available for selected dates
            </div>

            <div className="flex items-center gap-4">
              {quantityInCart > 0 ? (
                <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
                  <button
                    onClick={() => onUpdateCart(-1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  >
                    <Minus size={18} weight="bold" />
                  </button>
                  <span className="font-bold text-xl w-6 text-center">{quantityInCart}</span>
                  <button
                    onClick={() => onUpdateCart(1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    disabled={quantityInCart >= maxAvailable}
                  >
                    <Plus size={18} weight="bold" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onUpdateCart(1)}
                  className="px-8 py-4 bg-brown-dark text-white rounded-xl font-semibold hover:bg-brown-medium transition-colors shadow-md flex items-center gap-2"
                >
                  <span>Add to Stay</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                    ₹{room.base_price.toLocaleString()}
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
