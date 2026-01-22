import crypto from "crypto";

interface PaymentData {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
  address1?: string;
  address2?: string;
}

export class EasebuzzPayment {
  private key: string;
  private salt: string;
  private env: string;

  constructor() {
    this.key = process.env.EASEBUZZ_KEY || "";
    this.salt = process.env.EASEBUZZ_SALT || "";
    this.env = process.env.EASEBUZZ_ENV || "TEST";

    if (!this.key || !this.salt) {
      console.error("Easebuzz keys are missing in environment variables.");
    }
  }

  private getBaseUrl() {
    return this.env === "PROD"
      ? "https://pay.easebuzz.in"
      : "https://testpay.easebuzz.in";
  }

  public generateHash(data: PaymentData): string {
    const hashString = `${this.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ""}|${data.udf2 || ""}|${data.udf3 || ""}|${data.udf4 || ""}|${data.udf5 || ""}|${data.udf6 || ""}|${data.udf7 || ""}|${data.udf8 || ""}|${data.udf9 || ""}|${data.udf10 || ""}|${this.salt}`;
    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  public verifyHash(response: any): boolean {
    const {
      status,
      udFs,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      hash,
      key,
    } = response;
    // Easebuzz reverse hash format:
    // salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key

    // Note: response object might differ based on how it's parsed.
    // Usually response contains udf1...udf10 keys directly.

    const udf1 = response.udf1 || "";
    const udf2 = response.udf2 || "";
    const udf3 = response.udf3 || "";
    const udf4 = response.udf4 || "";
    const udf5 = response.udf5 || "";
    const udf6 = response.udf6 || "";
    const udf7 = response.udf7 || "";
    const udf8 = response.udf8 || "";
    const udf9 = response.udf9 || "";
    const udf10 = response.udf10 || "";

    const hashString = `${this.salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${this.key}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    return calculatedHash === hash;
  }

  public async initiatePayment(data: PaymentData) {
    const hash = this.generateHash(data);
    const formData = new URLSearchParams();

    formData.append("key", this.key);
    formData.append("txnid", data.txnid);
    formData.append("amount", data.amount);
    formData.append("productinfo", data.productinfo);
    formData.append("firstname", data.firstname);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("surl", data.surl);
    formData.append("furl", data.furl);
    formData.append("hash", hash);

    if (data.udf1) formData.append("udf1", data.udf1);
    if (data.udf2) formData.append("udf2", data.udf2);
    if (data.udf3) formData.append("udf3", data.udf3);
    if (data.udf4) formData.append("udf4", data.udf4);
    if (data.udf5) formData.append("udf5", data.udf5);

    // address fields if present
    if (data.address1) formData.append("address1", data.address1);
    if (data.city) formData.append("city", data.city);
    if (data.state) formData.append("state", data.state);
    if (data.country) formData.append("country", data.country);
    if (data.zipcode) formData.append("zipcode", data.zipcode);

    try {
      const response = await fetch(
        `${this.getBaseUrl()}/payment/initiateLink`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        },
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Easebuzz Initiate Error:", error);
      throw error;
    }
  }

  public async checkPaymentStatus(txnid: string) {
    const hashString = `${this.key}|${txnid}|${this.salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    const formData = new URLSearchParams();
    formData.append("key", this.key);
    formData.append("txnid", txnid);
    formData.append("hash", hash);

    try {
      const response = await fetch(
        `${this.getBaseUrl()}/transaction/v1/retrieve`,
        {
          method: "POST",
          body: formData,
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Easebuzz Status Check Error:", error);
      throw error;
    }
  }
}

export const easebuzz = new EasebuzzPayment();
