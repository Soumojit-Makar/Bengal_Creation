function DeliveryPolicy() {
  const sections = [
    {
      title: "1. Delivery Areas",
      text: `We currently provide delivery services in selected locations.
Delivery availability depends on your location and service coverage.
Orders placed outside serviceable areas may be declined.`,
    },
    {
      title: "2. Delivery Timings",
      text: `Food Delivery (Tiffin / Meals):
Standard delivery time: 30–60 minutes.

Delivery time may vary depending on order volume, distance, traffic, and weather conditions.

E-commerce Products:
Delivery timeline: 2–7 business days.
Delivery time may vary based on product availability and location.`,
    },
    {
      title: "3. Delivery Charges",
      text: `Delivery charges may vary depending on distance, order value, and service type.
Free delivery may be offered on promotional offers or minimum order value.`,
    },
    {
      title: "4. Order Tracking",
      text: `Customers will receive updates via SMS, call, or app notifications.
Real-time tracking may be available within the app (if enabled).`,
    },
    {
      title: "5. Delivery Attempts",
      text: `Our delivery partner will attempt delivery at the provided address.
If the customer is unavailable, the delivery agent may contact via phone.
If unreachable, the order may be cancelled.`,
    },
    {
      title: "6. Failed Delivery",
      text: `Delivery may be marked as failed if the address is incorrect, the customer is not reachable, or the customer refuses to accept the order.

No refund may be provided for perishable items (food).
Refunds for other products will be handled as per the Refund Policy.`,
    },
    {
      title: "7. Contactless Delivery",
      text: `Contactless delivery option may be available upon request.
Customers can mention instructions while placing the order.`,
    },
    {
      title: "8. Delays in Delivery",
      text: `Delays may occur due to traffic conditions, weather issues, or high demand.
We will try to inform customers proactively in such cases.`,
    },
    {
      title: "9. Damaged or Missing Items",
      text: `Customers must report issues within 2 hours of delivery.
Photo proof may be required.
Resolution may include replacement or refund.`,
    },
    {
      title: "10. Customer Responsibilities",
      text: `Provide accurate delivery address and contact details.
Be available to receive the order.
Follow hygiene and safety guidelines during delivery.`,
    },
    {
      title: "11. Contact Information",
      text: `Digital Indian
Website: https://digitalindian.co.in
Email: info@digitalindian.co.in
Phone: +91-9830640814`,
    },
    {
      title: "12. Policy Updates",
      text: `We reserve the right to update this Delivery Policy at any time.
Changes will be posted on this page.

By using our services, you agree to this Delivery Policy.`,
    },
  ];

  return (
    <div className="bgabout">
      <div className="about-hero">
        <h1>Delivery Policy</h1>
        <p
          style={{
            color: "rgba(245,228,184,0.8)",
            fontSize: 18,
            fontStyle: "italic",
          }}
        >
          Effective Date: [Insert Date]
          <br />
          This Delivery Policy outlines the terms and conditions related to
          delivery of orders placed on Digital Indian (digitalindian.co.in),
          including food delivery services (Tiffin Hub) and e-commerce products.
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
              whiteSpace: "pre-line", // IMPORTANT for line breaks
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

export default DeliveryPolicy;
