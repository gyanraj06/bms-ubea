
"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from "next/navigation";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { XCircle, ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function PaymentFailureContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const error = searchParams.get('error');

    return (
        <main className="min-h-screen bg-gray-50">
            <ChaletHeader forceLight={true} />
            <div className="h-20" />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={48} weight="fill" className="text-red-600" />
                        </div>

                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-8">
                            We couldn't process your payment. Please try again.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                Error: {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {/* Retry Payment - Always show, go to checkout */}
                            <Button
                                onClick={() => router.push(bookingId ? `/booking/checkout?restoreId=${bookingId}` : '/booking/checkout')}
                                className="w-full py-6 bg-brown-dark text-white rounded-xl font-semibold hover:bg-brown-medium transition-colors text-lg"
                            >
                                Retry Payment
                            </Button>



                            <Button
                                onClick={() => router.push("/my-bookings")}
                                variant="outline"
                                className="w-full py-6 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Go to My Bookings
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
                            <p>If money was deducted, it will be refunded automatically within 5-7 working days.</p>
                            <p className="mt-1">Need help? <a href="/contact" className="text-brown-dark underline">Contact Support</a></p>
                        </div>

                    </motion.div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentFailureContent />
        </Suspense>
    );
}
