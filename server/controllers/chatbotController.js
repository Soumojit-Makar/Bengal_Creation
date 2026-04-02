const Product = require("../models/product");
const Category = require("../models/category");
require("dotenv").config();
// ─── Static Knowledge Base ─────────────────────────────────────────────
const KNOWLEDGE_BASE = `ABOUT BENGAL CREATIONS / DIGITAL INDIAN: Bengal Creations is an e-commerce platform by Digital Indian that showcases and sells authentic handmade and handloom products from West Bengal artisans.
                         Website: https://digitalindian.co.in Email: info@digitalindian.co.in Phone: +91-9830640814 | +91-7908735132 Office: EN-9, Sector V, Salt Lake, Kolkata, West Bengal - 700091 Working Hours: Mon–Sun, 10:00 AM – 7:00 PM 
                         DELIVERY POLICY: 
                         - Delivery is available in selected locations across India. 
                         - E-commerce products: delivery within 2–7 business days. 
                         - Delivery charges vary by distance, order value, and service type.
                         - Free delivery may apply on promotional offers or minimum order value. 
                         - Order tracking is available via SMS, call, or app notifications. 
                         - Damaged or missing items must be reported within 2 hours of delivery with photo proof. 
                         - Resolution for damages includes replacement or refund. 
                         - Failed delivery may occur if address is incorrect or customer is unreachable.
                        REFUND POLICY: 
                        - Refund requests must be raised within 7 days of delivery. 
                        - Products must be unused and in original packaging. 
                        - Refunds are processed within 5–7 business days. 
                        - Perishable/food items are non-refundable. 
                        - Custom/personalized orders may not be eligible for refund. 
                        - Refund is credited back to the original payment method. 
                        PRIVACY POLICY: 
                        - We collect: name, phone, email, delivery address, and payment details (via secure gateways). 
                        - We do NOT sell your personal data to third parties. 
                        - Data is shared only with delivery partners, payment gateways, and legal authorities if required. 
                        - We use cookies to enhance experience and analyze traffic. 
                        - Users can request data deletion by contacting us. 
                        PAYMENT METHODS: 
                        - Razorpay (UPI, Credit/Debit Cards, Net Banking) 
                        - GPay, Paytm, PhonePe 
                        - RuPay, Visa, Mastercard 
                        - All transactions are secured with SSL encryption. 
                        PRODUCTS: Bengal Creations features authentic handmade products including: 
                        - Handloom Sarees (Tant, Baluchari, Jamdani, Kantha stitch) 
                        - Muslin fabrics and dress materials 
                        - Terracotta jewelry and home decor 
                        - Dokra metalcraft 
                        - Kantha quilts and embroidered items 
                        - Bamboo and cane handicrafts 
                        - Patachitra paintings 
                        - Bengal sweets and food products 
                        - Jute bags and accessories 
                        All products are sourced directly from verified artisans and vendors across West Bengal districts. 

                        VENDOR INFORMATION: 
                        - Local artisans and craftspeople from West Bengal can register as vendors. 
                        - Vendors manage their own product listings and inventory. 
                        - Vendor registration requires trade license, Aadhaar, and PAN verification. 

                        CONTACT SUPPORT: 
                        For order issues, product queries, vendor support, or partnerships, contact us via: 
                        - Contact form on the website 
                        - Email: info@digitalindian.co.in 
                        - Phone: +91-9830640814 

                        SHIPPING DISTRICTS: 
                        Products are sourced from various West Bengal districts including Kolkata, Murshidabad, Birbhum, Bankura, Purulia, Nadia, Hooghly, Malda, and more.`;

// ─── Simple Vector Search ──────────────────────────────────────────────
function findRelevantContext(question, products = []) {
  const q = question.toLowerCase();

  const sections = KNOWLEDGE_BASE.split("\n\n");
  const relevantSections = sections.filter((section) => {
    const keywords = q.split(" ").filter((w) => w.length > 3);
    return keywords.some((kw) => section.toLowerCase().includes(kw));
  });

  let context = relevantSections.slice(0, 4).join("\n\n");

  if (
    q.includes("product") ||
    q.includes("saree") ||
    q.includes("craft") ||
    q.includes("buy") ||
    q.includes("available") ||
    q.includes("price") ||
    q.includes("item") ||
    q.includes("sell")
  ) {
    if (products.length > 0) {
      const productContext = products
        .slice(0, 10)
        .map(
          (p) =>
            `- ${p.name} | Category: ${p.category?.name || "Misc"} | Price: ₹${p.price} | District: ${p.district || "WB"} | ${p.description || ""}`,
        )
        .join("\n");

      context += `\n\nCURRENT PRODUCTS IN STORE:\n${productContext}`;
    }
  }

  return context || KNOWLEDGE_BASE.substring(0, 1500);
}

// ─── Build Prompt ──────────────────────────────────────────────────────
function buildPrompt(question, context) {
  return `You are a friendly customer support assistant for Bengal Creations (by Digital Indian).

Use ONLY the context below to answer the customer's question.

If the answer is not in the context, politely say you don't have that information and suggest contacting support.

CONTEXT:
${context}

QUESTION:
${question}

INSTRUCTIONS:
- Be friendly, concise, helpful
- Keep under 150 words
- Use ₹ for prices

ANSWER:`;
}

// ─── Main Controller (Groq Version) ────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ msg: "Question is required" });
    }

    // Fetch products
    let products = [];
    try {
      products = await Product.find({ isActive: true })
        .populate("category")
        .limit(20)
        .lean();
    } catch (e) {}

    const context = findRelevantContext(question, products);
    const prompt = buildPrompt(question, context);

    // ─── GROQ API CALL ────────────────────────────────────────────────
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [...history.slice(-4), { role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 400,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();

    const answer =
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't process that. Please contact us at info@digitalindian.co.in.";

    res.json({ answer, question });
  } catch (err) {
    console.error("Chatbot error:", err.message);

    res.status(500).json({
      answer:
        "I'm temporarily unavailable. Please contact us at info@digitalindian.co.in or call +91-9830640814.",
      error: err.message,
    });
  }
};

module.exports = { chat };
