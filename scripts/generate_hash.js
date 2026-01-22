
const crypto = require('crypto');

const key = "LDY4WLIA4";
const salt = "CFYIWY1PI";

const data = {
    txnid: "TEST_" + Date.now(),
    amount: "100.00",
    productinfo: "Test_Product",
    firstname: "Test_User",
    email: "test@example.com",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    udf6: "",
    udf7: "",
    udf8: "",
    udf9: "",
    udf10: ""
};

const hashString = `${key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}|${data.udf6}|${data.udf7}|${data.udf8}|${data.udf9}|${data.udf10}|${salt}`;
const hash = crypto.createHash('sha512').update(hashString).digest('hex');

console.log("TxnID:", data.txnid);
console.log("Hash:", hash);
console.log("\nComplete cURL Command:");
console.log(`curl -X POST https://testpay.easebuzz.in/payment/initiateLink \\
  -d "key=${key}" \\
  -d "txnid=${data.txnid}" \\
  -d "amount=${data.amount}" \\
  -d "productinfo=${data.productinfo}" \\
  -d "firstname=${data.firstname}" \\
  -d "email=${data.email}" \\
  -d "phone=9999999999" \\
  -d "surl=http://localhost:3000/api/payment/webhook" \\
  -d "furl=http://localhost:3000/api/payment/webhook" \\
  -d "hash=${hash}"`);
