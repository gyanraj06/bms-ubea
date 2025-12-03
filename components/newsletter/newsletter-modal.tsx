"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FilePdf, FileDoc, FileText, DownloadSimple, CalendarBlank, Megaphone, ChartBar } from "@phosphor-icons/react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";


interface Attachment {
    name: string;
    url: string;
    type: string;
}

interface Newsletter {
    id: string;
    title: string;
    type: string;
    content?: string;
    file_url?: string;
    attachments?: Attachment[];
    created_at: string;
}

interface NewsletterModalProps {
    item: Newsletter | null;
    onClose: () => void;
}

export function NewsletterModal({ item, onClose }: NewsletterModalProps) {
    if (!item) return null;

    // Normalize attachments
    const allAttachments = item.attachments && item.attachments.length > 0
        ? item.attachments
        : item.file_url
            ? [{ name: "Attachment", url: item.file_url, type: "unknown" }]
            : [];

    const images = allAttachments.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    });

    const documents = allAttachments.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    });

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FilePdf size={24} className="text-red-500" />;
        if (['doc', 'docx'].includes(ext || '')) return <FileDoc size={24} className="text-blue-500" />;
        return <FileText size={24} className="text-gray-500" />;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'broadcast': return <Megaphone size={20} className="text-orange-600" />;
            case 'report': return <ChartBar size={20} className="text-blue-600" />;
            case 'calendar': return <CalendarBlank size={20} className="text-purple-600" />;
            default: return <FileText size={20} className="text-gray-600" />;
        }
    };

    return (
        <AnimatePresence>
            {item && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.type === 'broadcast' ? 'bg-orange-50' :
                                        item.type === 'report' ? 'bg-blue-50' :
                                            item.type === 'calendar' ? 'bg-purple-50' :
                                                'bg-gray-50'
                                        }`}>
                                        {getTypeIcon(item.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">{item.title}</h2>
                                        <p className="text-xs text-gray-500">{formatDate(new Date(item.created_at))}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                                    <X size={24} />
                                </Button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 space-y-8">

                                {/* Images Grid */}
                                {images.length > 0 && (
                                    <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                        {images.map((img, idx) => (
                                            <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                                <img src={img.url} alt={img.name} className="w-full h-auto object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Content */}
                                {item.content && (
                                    <div className="prose prose-gray max-w-none">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                                            {item.content}
                                        </p>
                                    </div>
                                )}

                                {/* Documents & Downloads */}
                                {allAttachments.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <DownloadSimple size={18} />
                                            Downloads & Attachments
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {allAttachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-brown-dark hover:shadow-sm transition-all group"
                                                >
                                                    <div className="shrink-0 p-2 bg-gray-50 rounded-md group-hover:bg-brown-dark/5 transition-colors">
                                                        {getFileIcon(file.name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brown-dark transition-colors">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 uppercase">{file.name.split('.').pop()}</p>
                                                    </div>
                                                    <DownloadSimple size={20} className="text-gray-400 group-hover:text-brown-dark" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* PDF Previews for Documents */}
                                {/* PDF Previews for Documents - REPLACED WITH STATIC LINK */}
                                {documents.map((doc, idx) => (
                                    doc.name.toLowerCase().endsWith('.pdf') && (
                                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
                                            <FilePdf size={64} className="text-red-500 mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">{doc.name}</h4>
                                            <p className="text-gray-500 mb-6 max-w-sm">
                                                This document is available for download. Click the button below to view the full PDF.
                                            </p>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button className="gap-2">
                                                    <DownloadSimple size={18} />
                                                    Download PDF
                                                </Button>
                                            </a>
                                        </div>
                                    )
                                ))}

                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
