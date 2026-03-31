function RefundPolicy() {
  const sections = [
    {
      title: "1. Food Delivery Orders (Tiffin / Meal Services)",
      text: `Order Cancellation:
Orders can be cancelled within 5 minutes of placing the order.
Once the order is confirmed and preparation has started, cancellation may not be possible.

Refund Policy:
If an order is cancelled within the allowed time, a full refund will be processed.
If the order is cancelled after preparation has started, no refund will be issued.

Failed / Delayed Delivery:
If we fail to deliver your order, you are eligible for a full refund.
In case of significant delay, partial refunds or coupons may be provided.

Incorrect / Damaged Order:
If you receive incorrect or damaged items, report within 2 hours of delivery with proof (photo).
Eligible cases will receive a replacement or refund.`,
    },
    {
      title: "2. E-commerce Products",
      text: `Cancellation:
Orders can be cancelled before dispatch.

Returns & Refunds:
Products can be returned within 7 days of delivery if:
- Item is damaged
- Item is incorrect

Refund will be processed after verification.

Non-Returnable Items:
Customized or perishable items may not be eligible for return.`,
    },
    {
      title: "3. Training & Digital Services",
      text: `Cancellation:
Cancellation requests must be made before the start of the program/service.

Refund Policy:
Once the training or service has started, no refund will be issued.
In special cases, partial refunds may be considered at management discretion.`,
    },
    {
      title: "4. Payment Refund Timeline",
      text: `Refunds will be processed within 5–10 business days.
The amount will be credited to the original payment method.`,
    },
    {
      title: "5. Contact for Refund Requests",
      text: `Digital Indian
Website: https://digitalindian.co.in
Email: your-email@example.com
Phone: +91-XXXXXXXXXX`,
    },
    {
      title: "6. Policy Updates",
      text: `We reserve the right to modify this policy at any time.
Updates will be posted on this page.

By using our services, you agree to this Refund & Cancellation Policy.`,
    },
  ];

  return (
    <div className="bgabout">
      <div className="about-hero">
        <h1>Refund & Cancellation Policy</h1>
        <p
          style={{
            color: "rgba(245,228,184,0.8)",
            fontSize: 18,
            fontStyle: "italic",
          }}
        >
          Effective Date: [Insert Date]
          <br />
          This Refund & Cancellation Policy applies to all services offered by
          Digital Indian (digitalindian.co.in), including food delivery,
          e-commerce products, training programs, and digital services.
        </p>
      </div>

      <div className="about-content">
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              marginBottom: 32,
              background: "white",
              borderRadius: 16,
              padding: 32,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
              whiteSpace: "pre-line", // keeps formatting
            }}
          >
            <h3
              style={{
                color: "var(--maroon)",
                fontSize: 22,
                marginBottom: 12,
              }}
            >
              {section.title}
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RefundPolicy;