const Product = require("../models/product");
const Category = require("../models/category");
require("dotenv").config();
// ─── Static Knowledge Base ─────────────────────────────────────────────
const KNOWLEDGE_BASE = `... (same as your existing KB, no change)`;

// ─── Simple Vector Search ──────────────────────────────────────────────
function findRelevantContext(question, products = []) {
  const q = question.toLowerCase();

  const sections = KNOWLEDGE_BASE.split("\n\n");
  const relevantSections = sections.filter(section => {
    const keywords = q.split(" ").filter(w => w.length > 3);
    return keywords.some(kw => section.toLowerCase().includes(kw));
  });

  let context = relevantSections.slice(0, 4).join("\n\n");

  if (
    q.includes("product") || q.includes("saree") || q.includes("craft") ||
    q.includes("buy") || q.includes("available") || q.includes("price") ||
    q.includes("item") || q.includes("sell")
  ) {
    if (products.length > 0) {
      const productContext = products.slice(0, 10).map(p =>
        `- ${p.name} | Category: ${p.category?.name || "Misc"} | Price: ₹${p.price} | District: ${p.district || "WB"} | ${p.description || ""}`
      ).join("\n");

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
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          ...history.slice(-4),
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

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