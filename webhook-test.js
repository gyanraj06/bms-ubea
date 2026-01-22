const crypto = require('crypto');

// 1. CONFIGURATION
const KEY = "YOUR_TEST_KEY_HERE";    // Check your .env
const SALT = "YOUR_TEST_SALT_HERE";  // Check your .env
const URL = "http://localhost:3000/api/payment/callback";

// 2. THE PAYLOAD
const data = {
    key: KEY,
    txnid: "C7MRI6EI11",       // Ensure this matches a booking in your DB if you want DB update to work
    amount: "1.0",
    firstname: "shopify Account",
    email: "john@gmail.in",
    phone: "8000000000",
    productinfo: "Account",
    status: "success",
    easepayid: "E2501789CVRAAA",
    udf1: "", udf2: "", udf3: "", udf4: "", udf5: "",
    udf6: "", udf7: "", udf8: "", udf9: "", udf10: ""
};

// 3. GENERATE HASH (Using Native Node Crypto)
const hashString = `${SALT}|${data.status}|${data.udf10}|${data.udf9}|${data.udf8}|${data.udf7}|${data.udf6}|${data.udf5}|${data.udf4}|${data.udf3}|${data.udf2}|${data.udf1}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
const hash = crypto.createHash('sha512').update(hashString).digest('hex');

data.hash = hash;

// 4. SEND THE REQUEST (Using Native Fetch)
async function sendWebhook() {
    const params = new URLSearchParams();
    for (const key in data) params.append(key, data[key]);

    console.log(`🚀 Firing Webhook to: ${URL}`);
    
    try {
        const res = await fetch(URL, {
            method: 'POST',
            body: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (res.redirected) {
             console.log("✅ SUCCESS: Server accepted data and redirected.");
        } else {
             console.log(`ℹ️ Server Response: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error("🔥 Connection Error:", e.cause || e.message);
    }
}

sendWebhook();