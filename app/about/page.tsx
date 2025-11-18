"use client";

import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Sparkle, Heart, Users, Trophy } from "@phosphor-icons/react/dist/ssr";

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "Community First",
      description:
        "A dedicated facility created exclusively for UBEA and AIBEA members, fostering a strong sense of union community and trust.",
    },
    {
      icon: Heart,
      title: "Member-Centric Service",
      description:
        "Every aspect is managed with our members in mind, providing unparalleled value and convenience at subsidized rates.",
    },
    {
      icon: Sparkle,
      title: "Comfort & Security",
      description:
        "A comfortable, secure haven where members and their families can feel truly at home, away from commercial complexities.",
    },
    {
      icon: Trophy,
      title: "Continuous Enhancement",
      description:
        "Dedicated to enhancing the Union Awaas experience, serving our growing family of members with excellence.",
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
            Our Story: A Home for Our Members
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            A dedicated initiative by UBEA and AIBEA to provide a comfortable,
            secure, and affordable haven for our members
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Introduction
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              The Union Awaas in Bhopal is more than just a guest house; it's a dedicated
              initiative by the United Bank Employees' Association (UBEA) and the All India
              Bank Employees' Association (AIBEA) to provide a comfortable, secure, and
              affordable haven for our esteemed members and their families.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              The Vision
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Our journey began with a clear vision: to create a dedicated facility that caters
              specifically to the needs of our union members – serving officers, employees, and
              retirees alike. Recognizing the challenges of finding suitable accommodation during
              travel or official visits, UBEA and AIBEA collaborated to establish a space where
              members could feel truly at home, away from the complexities of commercial hotels.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Our Commitment to Members
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Every aspect of Union Awaas is managed with our members in mind. From the carefully
              maintained facilities to the exclusive, subsidized tariffs, our aim is to provide
              unparalleled value and convenience. We understand the importance of trust and community
              within our union, and Union Awaas stands as a testament to that commitment.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Looking Ahead
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              As we continue to serve our growing family of members, we remain dedicated to enhancing
              the Union Awaas experience. We invite all eligible UBEA and AIBEA members to experience
              the comfort, convenience, and community spirit of their very own holiday home in Bhopal.
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
