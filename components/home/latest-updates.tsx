"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, NewspaperClipping } from "@phosphor-icons/react";
import Link from "next/link";
import { NewsletterCard } from "@/components/newsletter/newsletter-card";
import { NewsletterModal } from "@/components/newsletter/newsletter-modal";
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

export function LatestUpdates() {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

    useEffect(() => {
        const fetchNewsletters = async () => {
            try {
                // Fetch all, we'll slice the top 3
                const response = await fetch("/api/newsletter");
                if (response.ok) {
                    const data = await response.json();
                    // Take only the first 3
                    setNewsletters((data.newsletters || []).slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching latest updates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsletters();
    }, []);

    if (!loading && newsletters.length === 0) {
        return null; // Don't show section if empty
    }

    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brown-dark/5 to-transparent -z-10" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brown-dark/10 text-brown-dark text-sm font-medium mb-4"
                        >
                            <NewspaperClipping size={16} />
                            <span>Community Updates</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight"
                        >
                            Latest News & Events
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 mt-4 text-lg"
                        >
                            Stay informed with the most recent announcements and reports from our community.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link href="/newsletter">
                            <Button variant="outline" className="group border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-white transition-colors">
                                View All Updates
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 rounded-2xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory md:snap-none -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
                        {newsletters.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="min-w-[85vw] md:min-w-0 snap-center"
                            >
                                <NewsletterCard
                                    item={item}
                                    onClick={() => setSelectedNewsletter(item)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <NewsletterModal
                item={selectedNewsletter}
                onClose={() => setSelectedNewsletter(null)}
            />
        </section>
    );
}
