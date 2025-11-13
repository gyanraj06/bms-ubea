"use client";

import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Sparkle, Heart, Users, Trophy } from "@phosphor-icons/react/dist/ssr";

export default function AboutPage() {
  const values = [
    {
      icon: Sparkle,
      title: "Excellence",
      description:
        "We strive for perfection in every detail, ensuring an unmatched experience for our guests.",
    },
    {
      icon: Heart,
      title: "Hospitality",
      description:
        "Warm, genuine service is at the heart of everything we do. Your comfort is our priority.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We believe in building lasting relationships with our guests and the local community.",
    },
    {
      icon: Trophy,
      title: "Innovation",
      description:
        "Constantly evolving to provide modern luxury while honoring timeless traditions.",
    },
  ];


  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader />

      {/* Hero Banner */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            25 years of creating unforgettable experiences and redefining luxury
            hospitality
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Since opening our doors in 1999, Happy Holidays has been
              synonymous with exceptional hospitality, elegant accommodations,
              and unforgettable experiences. What started as a modest boutique
              hotel has grown into one of the region's most prestigious luxury
              destinations.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Our commitment to excellence extends beyond our beautifully
              appointed rooms and world-class amenities. We believe in creating
              moments that matter—whether it's a romantic getaway, a family
              celebration, or an important business event. Every guest is
              treated not just as a visitor, but as a valued member of our
              extended family.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Today, we continue to evolve and innovate while staying true to
              the core values that have defined us from the beginning:
              exceptional service, attention to detail, and a genuine passion
              for hospitality.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon
                      size={40}
                      weight="fill"
                      className="text-primary-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
