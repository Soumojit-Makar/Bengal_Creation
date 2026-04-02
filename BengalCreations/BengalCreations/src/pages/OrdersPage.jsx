import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders, requestRefund } from "../api/api";

const STATUS_COLORS = {
  Pending:    "#999",
  Processing: "#ff9800",
  Shipped:    "#1565c0",
  Delivered:  "var(--green)",
  Cancelled:  "var(--maroon)",
};
const STATUS_ICONS = {
  Pending: "⏳", Processing: "⚙️", Shipped: "🚚", Delivered: "📦", Cancelled: "❌",
};
const REFUND_BADGE = {
  Requested: { bg: "#fff3cd", color: "#856404", label: "🔄 Refund Requested" },
  Approved:  { bg: "#d1e7dd", color: "#0a3622", label: "✅ Refund Approved"  },
  Rejected:  { bg: "#f8d7da", color: "#58151c", label: "❌ Refund Rejected"  },
  Processed: { bg: "#cff4fc", color: "#055160", label: "💸 Refund Processed" },
};

function OrdersPage({ userId }) {
  const navigate = useNavigate();
  const [orders,        setOrders]        = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error,         setError]         = useState("");
  const [refundModal,   setRefundModal]   = useState(null); // orderId or null
  const [refundReason,  setRefundReason]  = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    setLoadingOrders(true);
    fetchUserOrders(userId)
      .then((data) => { setOrders(data); setLoadingOrders(false); })
      .catch((err) => { console.error(err); setError("Failed to load orders."); setLoadingOrders(false); });
  }, [userId, navigate]);

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) { alert("Please enter a reason for the refund."); return; }
    setRefundLoading(true);
    try {
      await requestRefund({ orderId: refundModal, reason: refundReason });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === refundModal
            ? { ...o, refundStatus: "Requested", refundReason, status: "Cancelled" }
            : o
        )
      );
      setRefundModal(null);
      setRefundReason("");
      alert("✅ Refund request submitted! Our team will process it within 3-5 business days.");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setRefundLoading(false);
    }
  };

  if (loadingOrders) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
      <p>Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--maroon)" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="bgabout">
      <div className="orders-header">
        <h2>📦 My Orders</h2>
        <p style={{ color: "rgba(245,228,184,0.7)", marginTop: 4, fontSize: 14 }}>
          Track your Bengal Creations orders
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px" }}>
        {!orders.length ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: "var(--text-muted)" }}>Start shopping to see your orders here!</p>
          </div>
        ) : (
          orders.map((o) => {
            const canRefund = o.paymentStatus === "Paid" && (!o.refundStatus || o.refundStatus === "None") && o.status !== "Cancelled";
            const refundBadge = o.refundStatus && o.refundStatus !== "None" ? REFUND_BADGE[o.refundStatus] : null;

            return (
              <div key={o._id} style={{
                background: "white", border: "1px solid var(--border)",
                borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)", marginBottom: 20,
              }}>
                {/* Order Header */}
                <div style={{
                  background: "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
                  padding: "16px 24px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", flexWrap: "wrap", gap: 8,
                }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(245,228,184,0.6)", textTransform: "uppercase" }}>
                      Order ID
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "var(--gold-light)", fontWeight: 700 }}>
                      {o._id}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "rgba(245,228,184,0.6)" }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-light)" }}>
                      ₹{o.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* Status Bar */}
                  <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{
                      padding: "6px 12px", borderRadius: 6,
                      background: STATUS_COLORS[o.status] || "#999",
                      color: "white", fontSize: 13,
                    }}>
                      {STATUS_ICONS[o.status]} {o.status}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      Payment: {o.paymentMethod} · <b>{o.paymentStatus}</b>
                    </div>
                    {refundBadge && (
                      <div style={{
                        padding: "5px 10px", borderRadius: 6, fontSize: 12,
                        background: refundBadge.bg, color: refundBadge.color, fontWeight: 600,
                      }}>
                        {refundBadge.label}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {o.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: 10, borderBottom: "1px solid #eee",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                        <div style={{ fontSize: 12, color: "#777" }}>
                          Qty: {item.quantity} · ₹{item.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}

                  {/* Address + Refund Button */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 12, color: "var(--text-muted)",
                    borderTop: "1px solid var(--border)", paddingTop: 12,
                    flexWrap: "wrap", gap: 10, marginTop: 12,
                  }}>
                    <span>
                      📍{" "}
                      {o.address
                        ? `${o.address.fullName}, ${o.address.city}, ${o.address.area}, ${o.address.pincode}`
                        : "Address unavailable"}
                    </span>

                    {canRefund && (
                      <button
                        onClick={() => { setRefundModal(o._id); setRefundReason(""); }}
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "1.5px solid #dc3545",
                          background: "white", color: "#dc3545", fontWeight: 700,
                          cursor: "pointer", fontSize: 12,
                        }}
                      >
                        🔄 Request Refund
                      </button>
                    )}
                  </div>

                  {/* Refund reason if requested */}
                  {o.refundStatus === "Requested" && o.refundReason && (
                    <div style={{
                      marginTop: 10, padding: "8px 12px", background: "#fff3cd",
                      borderRadius: 6, fontSize: 12, color: "#856404",
                    }}>
                      <b>Refund reason:</b> {o.refundReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20,
        }}>
          <div style={{
            background: "white", borderRadius: 16, padding: 32,
            maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8 }}>🔄 Request Refund</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Please tell us why you'd like a refund. Our team will review and process it within 3–5 business days.
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g. Product not as described, received damaged item..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleRefundRequest}
                disabled={refundLoading}
                style={{
                  flex: 1, padding: "12px 0", background: "var(--maroon)", color: "white",
                  border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
                }}
              >
                {refundLoading ? "Submitting…" : "Submit Request"}
              </button>
              <button
                onClick={() => { setRefundModal(null); setRefundReason(""); }}
                style={{
                  flex: 1, padding: "12px 0", background: "#f5f5f5", color: "#333",
                  border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
