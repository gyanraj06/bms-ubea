"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Images,
  Upload,
  Trash,
  Eye,
  FunnelSimple,
  Download,
  CloudArrowUp,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  url: string;
  title: string;
  category: "rooms" | "facilities" | "exterior" | "events";
  uploadDate: string;
  size: string;
}

export default function MediaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mock media data
  const mediaItems: MediaItem[] = [
    {
      id: "IMG001",
      url: "/images/room1.jpg",
      title: "Deluxe Room Interior",
      category: "rooms",
      uploadDate: "2025-11-10",
      size: "2.4 MB",
    },
    {
      id: "IMG002",
      url: "/images/pool.jpg",
      title: "Swimming Pool",
      category: "facilities",
      uploadDate: "2025-11-09",
      size: "3.1 MB",
    },
    {
      id: "IMG003",
      url: "/images/exterior.jpg",
      title: "Property Exterior",
      category: "exterior",
      uploadDate: "2025-11-08",
      size: "4.2 MB",
    },
    {
      id: "IMG004",
      url: "/images/event.jpg",
      title: "Wedding Event Setup",
      category: "events",
      uploadDate: "2025-11-07",
      size: "2.8 MB",
    },
  ];

  const categories = [
    { value: "all", label: "All Media", count: mediaItems.length },
    { value: "rooms", label: "Rooms", count: mediaItems.filter(m => m.category === "rooms").length },
    { value: "facilities", label: "Facilities", count: mediaItems.filter(m => m.category === "facilities").length },
    { value: "exterior", label: "Exterior", count: mediaItems.filter(m => m.category === "exterior").length },
    { value: "events", label: "Events", count: mediaItems.filter(m => m.category === "events").length },
  ];

  const filteredMedia = selectedCategory === "all"
    ? mediaItems
    : mediaItems.filter((item) => item.category === selectedCategory);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
    setSelectedFiles([]);
    setIsUploading(false);
  };

  const handleDelete = (id: string) => {
    toast.success("Media deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Media</h1>
          <p className="text-gray-600 mt-1">Manage photos and media gallery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <Download size={20} className="mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Media</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mediaItems.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Images size={24} className="text-purple-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rooms</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {mediaItems.filter(m => m.category === "rooms").length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Images size={24} className="text-blue-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facilities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {mediaItems.filter(m => m.category === "facilities").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Images size={24} className="text-green-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12.5 MB</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CloudArrowUp size={24} className="text-orange-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Media</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-dark focus:border-transparent"
            >
              <option value="rooms">Rooms</option>
              <option value="facilities">Facilities</option>
              <option value="exterior">Exterior</option>
              <option value="events">Events</option>
            </select>
          </div>

          <div>
            <Label htmlFor="files">Select Files</Label>
            <div className="mt-1 flex items-center gap-4">
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="bg-brown-dark text-white hover:bg-brown-medium"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {selectedFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brown-dark transition-colors">
            <CloudArrowUp size={48} className="mx-auto text-gray-400 mb-4" weight="duotone" />
            <p className="text-gray-600 mb-2">Drag and drop files here</p>
            <p className="text-sm text-gray-500">or click to browse (PNG, JPG, WEBP up to 10MB)</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === cat.value
                  ? "bg-brown-dark text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
          <Button variant="outline" size="sm">
            <FunnelSimple size={16} className="mr-2" />
            Sort
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
            >
              {/* Placeholder Image */}
              <div className="w-full h-full bg-gradient-to-br from-brown-light to-tan flex items-center justify-center">
                <Images size={48} className="text-brown-dark/30" weight="fill" />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye size={20} className="text-gray-900" weight="bold" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash size={20} className="text-white" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-white p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                  <span className="text-xs text-gray-500">{item.size}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <Images size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No media found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
