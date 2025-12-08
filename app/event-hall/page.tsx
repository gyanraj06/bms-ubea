"use client";

import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Users, Snowflake, ForkKnife, Toilet, Phone, WhatsappLogo, PresentationChart, Confetti } from "@phosphor-icons/react/dist/ssr";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EventHallPage() {
    const amenities = [
        { icon: Users, label: "Capacity", value: "40-50 People" },
        { icon: Snowflake, label: "Climate Control", value: "Air Conditioned" },
        { icon: ForkKnife, label: "Kitchen", value: "Fully Equipped" },
        { icon: Toilet, label: "Restroom", value: "Clean & Modern" },
    ];

    const purposes = [
        { icon: PresentationChart, label: "Meetings & Conferences", description: "Professional setting for your business needs." },
        { icon: Confetti, label: "Events & Parties", description: "Perfect for small gatherings and celebrations." },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <ChaletHeader />


            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url('/hall header.png')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center text-white max-w-4xl mx-auto px-4"
                >
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
                        Event Hall
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                        A versatile space for your meetings, conventions, and special events.
                    </p>
                </motion.div>
            </div>

            {/* Details Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
                            The Perfect Venue
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                            Our repurposed hall offers a flexible environment suitable for a variety of functions.
                            Whether you are hosting a corporate meeting, a union convention, or a private gathering,
                            our facility provides the comfort and amenities you need.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            {purposes.map((purpose) => (
                                <div key={purpose.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <purpose.icon size={32} className="text-primary-600 mb-4" weight="fill" />
                                    <h3 className="font-semibold text-gray-900 mb-2">{purpose.label}</h3>
                                    <p className="text-sm text-gray-500">{purpose.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {/* Amenities Grid */}
                        {amenities.map((item, index) => (
                            <div key={item.label} className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                    <item.icon size={32} className="text-primary-600" weight="fill" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                                <p className="text-primary-700 font-medium">{item.value}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <h2 className="font-serif text-3xl font-bold text-gray-900 mb-12 text-center">
                        Gallery
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { src: "/hall.png", label: "Spacious Hall" },
                            { src: "/kitchen.png", label: "Equipped Kitchen" },
                            { src: "/Garden.png", label: "Lush Garden" }
                        ].map((image, i) => (
                            <div key={i} className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative group">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{
                                        backgroundImage: `url('${image.src}')`,
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-end p-6">
                                    <p className="text-white font-semibold text-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        {image.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact CTA Section */}
            <div className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                        Ready to Book?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Contact us today to reserve the hall for your next event.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href="tel:9827058059"
                            className={cn(buttonVariants({ variant: "outline", size: "xl" }), "w-full sm:w-auto gap-3 border-white text-white hover:bg-white hover:text-primary-900")}
                        >
                            <Phone size={24} weight="fill" />
                            Call +91 98270 58059
                        </a>

                        <a
                            href="https://wa.me/919827058059"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg hover:shadow-xl")}
                        >
                            <WhatsappLogo size={24} weight="fill" />
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </main >
    );
}
