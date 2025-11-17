"use client";

import { useState, useEffect } from "react";
import { X, Download, Eye } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GuestDetail } from "@/types";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Full booking object with all enhanced fields
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [govtIdSignedUrl, setGovtIdSignedUrl] = useState<string>("");
  const [bankIdSignedUrl, setBankIdSignedUrl] = useState<string>("");
  const [loadingImages, setLoadingImages] = useState(true);

  // Fetch signed URLs for private bucket documents
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!booking) return;

      setLoadingImages(true);

      try {
        // Fetch signed URL for govt ID if exists
        if (booking.govt_id_image_url) {
          const govtIdPath = booking.govt_id_image_url.split('/').pop(); // Get file path from URL
          const govtIdFolder = booking.govt_id_image_url.includes('govt_id') ? 'govt_id/' : '';
          const fullGovtPath = govtIdFolder + govtIdPath;

          const govtResponse = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(fullGovtPath)}`);
          const govtData = await govtResponse.json();

          if (govtData.success) {
            setGovtIdSignedUrl(govtData.signedUrl);
          } else {
            // Fallback to original URL (might work for public buckets)
            setGovtIdSignedUrl(booking.govt_id_image_url);
          }
        }

        // Fetch signed URL for bank ID if exists
        if (booking.bank_id_image_url) {
          const bankIdPath = booking.bank_id_image_url.split('/').pop();
          const bankIdFolder = booking.bank_id_image_url.includes('bank_id') ? 'bank_id/' : '';
          const fullBankPath = bankIdFolder + bankIdPath;

          const bankResponse = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(fullBankPath)}`);
          const bankData = await bankResponse.json();

          if (bankData.success) {
            setBankIdSignedUrl(bankData.signedUrl);
          } else {
            // Fallback to original URL
            setBankIdSignedUrl(booking.bank_id_image_url);
          }
        }
      } catch (error) {
        console.error('Error fetching signed URLs:', error);
        // Fallback to original URLs
        if (booking.govt_id_image_url) setGovtIdSignedUrl(booking.govt_id_image_url);
        if (booking.bank_id_image_url) setBankIdSignedUrl(booking.bank_id_image_url);
      } finally {
        setLoadingImages(false);
      }
    };

    if (isOpen && booking) {
      fetchSignedUrls();
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const openImageViewer = (url: string, title: string) => {
    setViewingImage({ url, title });
    setImageViewerOpen(true);
  };

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download document");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const guestDetails: GuestDetail[] = booking.guest_details || [];
  const hasDocuments = booking.govt_id_image_url || booking.bank_id_image_url;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden pointer-events-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Booking Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking #{booking.booking_number}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X size={24} weight="bold" className="text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Booking Summary */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Booking Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Guest Name</p>
                        <p className="font-medium text-gray-900">
                          {booking.guest_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {booking.guest_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {booking.guest_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Check-in / Check-out
                        </p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(booking.check_in), "dd MMM yyyy")} -{" "}
                          {format(new Date(booking.check_out), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Nights</p>
                        <p className="font-medium text-gray-900">
                          {booking.total_nights} night
                          {booking.total_nights > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Number of Guests
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.num_guests} guest
                          {booking.num_guests > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room Type</p>
                        <p className="font-medium text-gray-900">
                          {booking.rooms?.room_type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-green-600 text-lg">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Booking For */}
                  {booking.booking_for && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Booking Information
                      </h3>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Booking For:</span>{" "}
                          <span className="capitalize">
                            {booking.booking_for === "self"
                              ? "Self"
                              : "Someone Else"}
                          </span>
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Bank ID Number */}
                  {booking.bank_id_number && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Bank Details
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Bank ID Number</p>
                        <p className="font-mono font-medium text-gray-900 mt-1">
                          {booking.bank_id_number}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Document Images */}
                  {hasDocuments && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Uploaded Documents
                      </h3>
                      {loadingImages ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading documents...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.govt_id_image_url && (
                            <div className="border border-gray-200 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                Government ID
                              </p>
                              <div className="relative aspect-video bg-gray-100 rounded overflow-hidden mb-3">
                                <img
                                  src={govtIdSignedUrl || booking.govt_id_image_url}
                                  alt="Government ID"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    openImageViewer(
                                      govtIdSignedUrl || booking.govt_id_image_url,
                                      "Government ID"
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Eye size={16} weight="bold" />
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    downloadDocument(
                                      govtIdSignedUrl || booking.govt_id_image_url,
                                      `govt_id_${booking.booking_number}.jpg`
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  <Download size={16} weight="bold" />
                                  Download
                                </button>
                              </div>
                            </div>
                          )}

                          {booking.bank_id_image_url && (
                            <div className="border border-gray-200 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                Bank ID
                              </p>
                              <div className="relative aspect-video bg-gray-100 rounded overflow-hidden mb-3">
                                <img
                                  src={bankIdSignedUrl || booking.bank_id_image_url}
                                  alt="Bank ID"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    openImageViewer(
                                      bankIdSignedUrl || booking.bank_id_image_url,
                                      "Bank ID"
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Eye size={16} weight="bold" />
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    downloadDocument(
                                      bankIdSignedUrl || booking.bank_id_image_url,
                                      `bank_id_${booking.booking_number}.jpg`
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  <Download size={16} weight="bold" />
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Guest Details */}
                  {guestDetails.length > 0 && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Guest Details
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                #
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Age
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {guestDetails.map((guest, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {guest.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {guest.age} years
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Additional Requirements */}
                  {(booking.needs_cot || booking.needs_extra_bed) && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Additional Requirements
                      </h3>
                      <div className="space-y-2">
                        {booking.needs_cot && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm font-medium text-green-900">
                              Cot Required
                            </span>
                            <span className="text-sm text-green-700">
                              Quantity: {booking.num_cots}
                            </span>
                          </div>
                        )}
                        {booking.needs_extra_bed && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm font-medium text-green-900">
                              Extra Bed Required
                            </span>
                            <span className="text-sm text-green-700">
                              Quantity: {booking.num_extra_beds}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Special Requests */}
                  {booking.special_requests && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Special Requests
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {booking.special_requests}
                        </p>
                      </div>
                    </section>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {imageViewerOpen && viewingImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImageViewerOpen(false)}
              className="fixed inset-0 bg-black/90 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-10 z-[60] flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="pointer-events-auto max-w-6xl w-full flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                  <h3 className="text-white text-xl font-semibold">
                    {viewingImage.title}
                  </h3>
                  <button
                    onClick={() => setImageViewerOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={28} weight="bold" className="text-white" />
                  </button>
                </div>
                <div className="bg-white p-2 rounded-lg max-h-[80vh] overflow-auto">
                  <img
                    src={viewingImage.url}
                    alt={viewingImage.title}
                    className="max-w-full max-h-[75vh] object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
