"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function WelcomeSection() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 text-brown-medium mb-6">
              <MapPin size={20} weight="fill" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Bhopal
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-brown-dark mb-6 leading-tight">
              Welcome to Union Awas
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              The official holiday home for members of the Union Bank Employees'
              Association, MP (UBEA), All India Union Bank Employees Association (AIUBEA), Madhya Pradesh Bank Employees Association (MPBEA) and All India Bank Employees' Association (AIBEA).
              We offer a clean, secure, and affordable stay exclusively for our
              union members, retirees, officers and their families visiting Bhopal.
            </p>

            <div className={`transition-all duration-300 ${isExpanded ? 'block' : 'hidden md:block'}`}>
              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                Conveniently located near SMH Hospital, our
                guest house provides easy access to the city's key landmarks. Enjoy
                our air-conditioned rooms, self-cooking kitchen, and dedicated meeting
                hall, all designed for your comfort.
              </p>
            </div>

            {/* Read More Trigger (Mobile Only) */}
            <div className="md:hidden mb-8">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 font-medium underline underline-offset-4 hover:text-gray-700 transition-colors"
                type="button"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => router.push('/booking')}
                className="inline-flex items-center px-8 py-4 bg-brown-dark text-white rounded-full text-base font-medium hover:bg-brown-medium transition-all duration-150"
              >
                Book Your Experience
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
