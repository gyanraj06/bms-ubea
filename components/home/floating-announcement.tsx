"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "@phosphor-icons/react";
import { NewsletterModal } from "@/components/newsletter/newsletter-modal";

interface Newsletter {
    id: string;
    title: string;
    type: string;
    content?: string;
    file_url?: string;
    attachments?: any[];
    created_at: string;
}

export function FloatingAnnouncement() {
    const [latest, setLatest] = useState<Newsletter | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const response = await fetch("/api/newsletter?limit=1");
                if (response.ok) {
                    const data = await response.json();
                    if (data.newsletters && data.newsletters.length > 0) {
                        setLatest(data.newsletters[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching floating announcement:", error);
            }
        };

        fetchLatest();

        // Always visible
        setIsVisible(true);
    }, []);

    if (!latest || isDismissed) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        className="fixed bottom-8 right-8 z-40 flex items-end flex-col gap-2"
                    >
                        {/* Tooltip / Teaser */}
                        <div className="bg-white rounded-lg shadow-xl p-3 mb-2 max-w-[200px] text-sm relative border border-amber-100 hidden md:block">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                                className="absolute -top-2 -left-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 hover:text-red-500"
                            >
                                <X size={12} />
                            </button>
                            <p className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                                {latest.title}
                            </p>
                            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-amber-100"></div>
                        </div>

                        {/* FAB */}
                        <motion.button
                            onClick={() => setShowModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-brown-dark to-amber-900 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative group"
                        >
                            {/* Pulse Effect */}
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping group-hover:block hidden"></span>

                            <Megaphone size={28} weight="fill" className="relative z-10" />

                            {/* Badge */}
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white items-center justify-center font-bold">1</span>
                            </span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {showModal && (
                <NewsletterModal
                    item={latest}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
