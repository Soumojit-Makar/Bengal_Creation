const Product = require("../models/product");
const Category = require("../models/category");

// ─── Static Knowledge Base (Policies + Shop Info) ─────────────────────────────
const KNOWLEDGE_BASE = `
ABOUT BENGAL CREATIONS / DIGITAL INDIAN:
Bengal Creations is an e-commerce platform by Digital Indian that showcases and sells authentic handmade and handloom products from West Bengal artisans.
Website: https://digitalindian.co.in
Email: info@digitalindian.co.in
Phone: +91-9830640814 | +91-7908735132
Office: EN-9, Sector V, Salt Lake, Kolkata, West Bengal - 700091
Working Hours: Mon–Sun, 10:00 AM – 7:00 PM

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

PRODUCTS:
Bengal Creations features authentic handmade products including:
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
Products are sourced from various West Bengal districts including Kolkata, Murshidabad, Birbhum, Bankura, Purulia, Nadia, Hooghly, Malda, and more.
`;

// ─── Simple Vector Search (Keyword similarity) ───────────────────────────────
function findRelevantContext(question, products = []) {
  const q = question.toLowerCase();
  
  // Find relevant policy sections
  const sections = KNOWLEDGE_BASE.split("\n\n");
  const relevantSections = sections.filter(section => {
    const keywords = q.split(" ").filter(w => w.length > 3);
    return keywords.some(kw => section.toLowerCase().includes(kw));
  });

  let context = relevantSections.slice(0, 4).join("\n\n");

  // Enrich with live product data if question is about products
  if (q.includes("product") || q.includes("saree") || q.includes("craft") || 
      q.includes("buy") || q.includes("available") || q.includes("price") ||
      q.includes("item") || q.includes("sell")) {
    if (products.length > 0) {
      const productContext = products.slice(0, 10).map(p =>
        `- ${p.name} | Category: ${p.category?.name || "Misc"} | Price: ₹${p.price} | District: ${p.district || "WB"} | ${p.description || ""}`
      ).join("\n");
      context += `\n\nCURRENT PRODUCTS IN STORE:\n${productContext}`;
    }
  }

  return context || KNOWLEDGE_BASE.substring(0, 1500);
}

// ─── Build prompt ─────────────────────────────────────────────────────────────
function buildPrompt(question, context) {
  return `You are a friendly customer support assistant for Bengal Creations (by Digital Indian), an e-commerce platform selling authentic handmade and handloom products from West Bengal artisans.

Use ONLY the context below to answer the customer's question. If the answer is not in the context, politely say you don't have that information and suggest contacting support at info@digitalindian.co.in or +91-9830640814.

CONTEXT:
${context}

CUSTOMER QUESTION: ${question}

INSTRUCTIONS:
- Be friendly, concise, and helpful.
- Answer only Bengal Creations / Digital Indian related questions.
- If asked about anything unrelated (politics, coding, general knowledge, etc.), politely redirect to Bengal Creations topics.
- Use ₹ for prices.
- Keep responses under 150 words unless a detailed policy explanation is needed.

ANSWER:`;
}

// ─── Main Controller ──────────────────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ msg: "Question is required" });
    }

    // Fetch live products for context
    let products = [];
    try {
      products = await Product.find({ isActive: true }).populate("category").limit(20).lean();
    } catch (e) {
      // Continue without products if DB fails
    }

    const context = findRelevantContext(question, products);
    const prompt = buildPrompt(question, context);

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [
          ...history.slice(-4), // keep last 4 messages for context
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "AI service error");
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || "I'm sorry, I couldn't process that. Please contact us at info@digitalindian.co.in.";

    res.json({ answer, question });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ 
      answer: "I'm temporarily unavailable. Please contact us at info@digitalindian.co.in or call +91-9830640814.",
      error: err.message 
    });
  }
};

module.exports = { chat };
