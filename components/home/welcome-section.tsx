"use client";

import { motion } from "framer-motion";
import { MapPin } from "@phosphor-icons/react";

export function WelcomeSection() {
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
              Welcome to Your Sanctuary
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Nestled in the heart of nature, our Happy Holidays offers an
              escape from the ordinary. Experience breathtaking views,
              world-class amenities, and unparalleled service that transforms
              every stay into an unforgettable journey.
            </p>

            <p className="text-base text-gray-600 leading-relaxed mb-10">
              Whether you're seeking adventure or tranquility, our location
              provides easy access to local attractions while maintaining the
              peace and privacy you deserve. Every room is a masterpiece, every
              service exceptional, every moment memorable.
            </p>

            <button className="inline-flex items-center px-8 py-4 bg-brown-dark text-white rounded-full text-base font-medium hover:bg-brown-medium transition-all duration-150">
              Book Your Experience
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
