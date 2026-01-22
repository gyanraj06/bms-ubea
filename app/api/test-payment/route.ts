import { NextResponse } from "next/server";
import { easebuzz } from "@/lib/easebuzz";

export async function GET() {
  try {
    const mockData = {
      txnid: `TEST_${Date.now()}`,
      amount: "100.00",
      productinfo: "Test Product",
      firstname: "Test User",
      email: "test@example.com",
      phone: "9999999999",
      surl: "http://localhost:3000/api/payment/webhook",
      furl: "http://localhost:3000/api/payment/webhook",
    };

    console.log("Test Route: Mock Data:", mockData);

    // Test Initiate
    const result = await easebuzz.initiatePayment(mockData);

    return NextResponse.json({
      success: true,
      data: result,
      mockKey: process.env.EASEBUZZ_KEY ? "Present" : "Missing",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
