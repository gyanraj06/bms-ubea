import { easebuzz } from "@/lib/easebuzz";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyPaymentFlow() {
  console.log("Starting Manual Verification...");

  // 1. Create a dummy booking (optional, or use existing)
  // For now, we will just test the Hash Generation and Initiate logic directly using lib

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

  console.log("Mock Data:", mockData);

  // 2. Test Hash Generation
  const hash = easebuzz.generateHash(mockData);
  console.log("Generated Hash:", hash);

  if (!hash) {
    console.error("Hash generation failed");
    return;
  }

  // 3. Test Initiate Payment (This calls external API, might fail if keys are invalid)
  try {
    console.log("Initiating Payment with Easebuzz...");
    const result = await easebuzz.initiatePayment(mockData);
    console.log("Initiate Result:", result);

    if (result.status === 1) {
      console.log("SUCCESS: Payment Initiated. Access Key:", result.data);
    } else {
      console.error("FAILURE: Payment Initiate Failed", result.data);
    }
  } catch (error) {
    console.error("EXCEPTION during Initiate:", error);
  }
}

// verifyPaymentFlow();
