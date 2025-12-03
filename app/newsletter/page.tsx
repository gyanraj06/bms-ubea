"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { NewsletterCard } from "@/components/newsletter/newsletter-card";
import { MagnifyingGlass, Funnel, NewspaperClipping } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { NewsletterModal } from "@/components/newsletter/newsletter-modal";

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

export default function NewsletterPublicPage() {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const fetchNewsletters = async () => {
        try {
            const response = await fetch("/api/newsletter");
            if (response.ok) {
                const data = await response.json();
                setNewsletters(data.newsletters || []);
            }
        } catch (error) {
            console.error("Error fetching newsletters:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredNewsletters = newsletters.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <ChaletHeader forceLight={true} />

            <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-12 relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brown-dark/5 to-transparent rounded-3xl -z-10" />
                        <div className="py-12 px-4 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brown-dark/10 text-brown-dark text-sm font-medium mb-4"
                                >
                                    <NewspaperClipping size={16} />
                                    <span>Community Updates</span>
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight"
                                >
                                    The Community Wall
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg text-gray-600 leading-relaxed"
                                >
                                    Your central hub for announcements, reports, news, and upcoming events. Stay connected with everything happening in our community.
                                </motion.p>
                            </div>

                            {/* Search & Filter - Integrated into Hero */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-4 min-w-[320px]"
                            >
                                <div className="relative">
                                    <MagnifyingGlass
                                        size={20}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <Input
                                        placeholder="Search updates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {["all", "news", "broadcast", "report", "calendar"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${selectedType === type
                                                ? "bg-brown-dark text-white shadow-md transform scale-105"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {type === "all" ? "All" : type}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
                        </div>
                    ) : filteredNewsletters.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                            <Funnel size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No updates found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredNewsletters.map((item) => (
                                <NewsletterCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => setSelectedNewsletter(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Detail Modal */}
            <NewsletterModal
                item={selectedNewsletter}
                onClose={() => setSelectedNewsletter(null)}
            />
        </div>
    );
}
