"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FilePdf,
    DownloadSimple,
    Image as ImageIcon,
    FileText,
    CaretLeft,
    CaretRight,
    FileDoc,
} from "@phosphor-icons/react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";


interface Attachment {
    name: string;
    url: string;
    type: string;
}

interface NewsletterCardProps {
    item: {
        id: string;
        title: string;
        type: string;
        content?: string;
        file_url?: string;
        attachments?: Attachment[];
        created_at: string;
    };
    onClick?: () => void;
}

export function NewsletterCard({ item, onClick }: NewsletterCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Normalize attachments
    const allAttachments = item.attachments && item.attachments.length > 0
        ? item.attachments
        : item.file_url
            ? [{ name: "Attachment", url: item.file_url, type: "unknown" }]
            : [];

    // Separate images and documents
    const images = allAttachments.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    });

    const documents = allAttachments.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    });

    const firstPdf = documents.find(doc => doc.name.toLowerCase().endsWith('.pdf'));

    // Auto-scroll carousel
    useEffect(() => {
        if (images.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length, isHovered]);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FilePdf size={32} className="text-red-500" />;
        if (['doc', 'docx'].includes(ext || '')) return <FileDoc size={32} className="text-blue-500" />;
        return <FileText size={32} className="text-gray-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full group cursor-pointer relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Expand Indicator */}
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-700">View Full</span>
                    <CaretRight size={12} className="text-gray-500" />
                </div>
            </div>
            {/* Image Carousel or PDF Preview */}
            {images.length > 0 ? (
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex].url}
                            alt={images[currentImageIndex].name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>

                    {images.length > 1 && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <CaretLeft size={16} weight="bold" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <CaretRight size={16} weight="bold" />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : firstPdf ? (
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden group-hover:opacity-90 transition-opacity flex items-center justify-center flex-col gap-2">
                    <FilePdf size={48} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-600">PDF Document</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm text-gray-900">
                            View Details
                        </div>
                    </div>
                </div>
            ) : (
                // Fallback or Type Indicator if no image
                <div className={`h-2 w-full ${item.type === 'broadcast' ? 'bg-orange-500' :
                    item.type === 'report' ? 'bg-blue-500' :
                        item.type === 'calendar' ? 'bg-purple-500' :
                            item.type === 'pdf' ? 'bg-red-500' :
                                'bg-gray-200'
                    }`} />
            )}

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.type === 'broadcast' ? 'bg-orange-50 text-orange-700' :
                        item.type === 'report' ? 'bg-blue-50 text-blue-700' :
                            item.type === 'calendar' ? 'bg-purple-50 text-purple-700' :
                                item.type === 'pdf' ? 'bg-red-50 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                        }`}>
                        {item.type}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                        {formatDate(new Date(item.created_at))}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brown-dark transition-colors">
                    {item.title}
                </h3>

                {/* Content */}
                {item.content && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {item.content}
                    </p>
                )}

                {/* Documents Section */}
                {documents.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="shrink-0">
                                    {getFileIcon(doc.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={doc.name}>
                                        {doc.name}
                                    </p>
                                    <p className="text-xs text-gray-500">Document</p>
                                </div>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-brown-dark hover:bg-white">
                                        <DownloadSimple size={18} />
                                    </Button>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
