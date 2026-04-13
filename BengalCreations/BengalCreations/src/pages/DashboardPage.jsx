import { useEffect, useState, useCallback } from "react";
import { uploadImage } from "../utils/cloudinary";
import { fetchPlatformSettings } from "../api/api";
import {
  fetchVendorProducts,
  fetchVendorOrders,
  fetchAllCategories,
  createProduct,
  fetchRefundRequests,
  processRefund,
  fetchOrderReport,
} from "../api/api";

function DashboardPage({ currentUser, onShowToast, WB_DISTRICTS }) {
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [hoverImg, setHoverImg] = useState(null);
  const [activeTab, setActiveTab] = useState("myproducts");
  const [dashProducts, setDashProducts] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState("🥻");
  const [selectedCat, setSelectedCat] = useState(null);
  const [catOptions, setCatOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRange, setReportRange] = useState({ startDate: "", endDate: "" });
  const [adminNote, setAdminNote] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    originPrice: "",
    stock: "",
    district: "",
    desc: "",
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order?.amount || 0), 0);

  useEffect(() => {
    if (!currentUser?._id) return;

    fetchVendorProducts(currentUser._id)
      .then(setDashProducts)
      .catch(console.error);

    fetchAllCategories()
      .then((data) => {
        setCatOptions(data);
        if (data.length > 0) setSelectedCat(data[0]);
      })
      .catch(console.error);

    fetchVendorOrders(currentUser._id)
      .then((data) => {
        setOrders(
          data.map((order) => ({
            id: order._id,
            product: order.items?.[0]?.product?.name || "Product",
            customer: order.user?.name || "Customer",
            amount: order.totalAmount,
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.status,
          }))
        );
      })
      .catch(console.error);

    fetchPlatformSettings().then(s => setAdminNote(s.adminNote || "")).catch(()=>{});
    fetchRefundRequests(currentUser._id)
      .then((data) => setRefunds(data.refunds || []))
      .catch(console.error);
  }, [currentUser]);

  const loadReport = useCallback(async () => {
    if (!currentUser?._id) return;
    setReportLoading(true);
    try {
      const data = await fetchOrderReport({
        vendorId: currentUser._id,
        startDate: reportRange.startDate,
        endDate: reportRange.endDate,
      });
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  }, [currentUser, reportRange]);

  const handleRefundAction = async (orderId, action) => {
    try {
      await processRefund({ orderId, action });
      setRefunds((prev) =>
        prev.map((r) =>
          r._id === orderId ? { ...r, refundStatus: action === "approve" ? "Processed" : "Rejected" } : r
        )
      );
    } catch (err) {
      alert("Failed to process refund: " + err.message);
    }
  };

  const resetForm = useCallback(() => {
    setForm({ name: "", price: "", originPrice: "", stock: "", district: "", desc: "" });
    setSelectedEmoji("🥻");
    if (catOptions.length > 0) setSelectedCat(catOptions[0]);
    setEditIdx(null);
    setImages([]);
    setImageFiles([]);
  }, [catOptions]);

  const saveProduct = async () => {
    if (!form.name) { onShowToast("⚠️ Please enter product name"); return; }
    if (!form.price) { onShowToast("⚠️ Please enter price"); return; }
    if (!form.stock) { onShowToast("⚠️ Please enter stock"); return; }
    if (!form.district) { onShowToast("⚠️ Please select district"); return; }
    if (imageFiles.length < 1) { onShowToast("⚠️ Please upload at least 1 image."); return; }
    if (imageFiles.length > 5) { onShowToast("⚠️ You can upload maximum 5 images only."); return; }

    try {
      const localUser = currentUser;
      const imageUrls = [];
      for (const file of imageFiles) {
        imageUrls.push(await uploadImage(file));
      }

      await createProduct({
        name: form.name,
        price: form.price,
        originalPrice: form.originPrice,
        stock: form.stock,
        category: selectedCat._id,
        district: form.district,
        description: form.desc,
        vendor: localUser._id,
        images: imageUrls,
      });

      onShowToast("Product Added Successfully!!");
    } catch (err) {
      console.error("Error saving product:", err);
      onShowToast("⚠️ Something went wrong. Please try again.");
    } finally {
      resetForm();
      setActiveTab("myproducts");
    }
  };

  const deleteProduct = useCallback((i) => {
    if (window.confirm("Remove this product?")) {
      setDashProducts((prev) => prev.filter((_, idx) => idx !== i));
      onShowToast("🗑️ Product removed.");
    }
  }, [onShowToast]);

  const editProduct = useCallback((i) => {
    const p = dashProducts[i];
    setForm({
      name: p.name,
      price: p.price,
      originPrice: p.original || "",
      stock: p.stock,
      district: p.district || "",
      desc: p.desc || "",
    });
    setSelectedEmoji(p.emoji);
    setSelectedCat(p.category);
    setEditIdx(i);
    setActiveTab("addproduct");
  }, [dashProducts]);

  return (
    <div className="bgabout">
      <div className="dash-header">
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(245,228,184,0.6)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Vendor Dashboard
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 24,
              color: "var(--gold-light)",
            }}
          >
            🏪 {currentUser?.shopName || "My Store"}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(245,228,184,0.7)", marginTop: 2 }}>
            📍 {currentUser?.address}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            ["myproducts", "📦 My Products"],
            ["addproduct", "➕ Add Product"],
            ["orders", "📋 Orders"],
            ["reports", "📊 Reports"],
            ["refunds", "🔄 Refunds"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              className="nav-btn"
              style={{
                background: activeTab === tab ? "rgba(200,146,42,0.2)" : "transparent",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {[
          [`₹${totalRevenue.toLocaleString()}`, "Revenue"],
          [dashProducts.length, "Products"],
          [orders.length, "Orders"],
          ["4.8 ★", "Rating", true],
        ].map(([val, label, gold]) => (
          <div className="dash-stat" key={label}>
            <div className="dash-stat-num" style={gold ? { color: "var(--gold)" } : {}}>
              {val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Note Banner */}
      {adminNote && (
        <div style={{ margin: "0 32px 16px", background: "rgba(200,146,42,0.15)", border: "1px solid rgba(200,146,42,0.4)", borderRadius: 10, padding: "12px 20px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>📣</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Admin Notice</div>
            <div style={{ fontSize: 14, color: "rgba(245,228,184,0.9)", lineHeight: 1.5 }}>{adminNote}</div>
          </div>
        </div>
      )}

      {/* My Products Tab */}
      {activeTab === "myproducts" && (
        <div className="dash-tab-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                color: "var(--maroon)",
              }}
            >
              My Products
            </h3>
            <button
              className="btn-gold"
              onClick={() => { resetForm(); setActiveTab("addproduct"); }}
            >
              ➕ Add New Product
            </button>
          </div>
          {!dashProducts.length ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p>No products yet. Click "Add Product" to start!</p>
            </div>
          ) : (
            <div className="products-grid">
              {dashProducts.map((p, i) => (
                <div className="dash-product-card" key={p.id}>
                  <div className="dash-product-img">
                    {p.thumb ? (
                      <img src={p.thumb} alt={p.name} loading="lazy" />
                    ) : (
                      <div
                        style={{
                          fontSize: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {p.emoji}
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                      <button
                        onClick={() => editProduct(i)}
                        style={{
                          background: "rgba(200,146,42,0.9)",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteProduct(i)}
                        style={{
                          background: "rgba(122,28,46,0.85)",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: p.stock < 5 ? "var(--maroon)" : "var(--green)",
                        color: "white",
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontWeight: 700,
                      }}
                    >
                      {p.stock < 5 ? "⚠️ Low" : "✓ In Stock"}
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 14,
                        color: "var(--maroon)",
                        fontWeight: 700,
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                      {p.category} · {p.district}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>
                        ₹{p.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === "addproduct" && (
        <div className="dash-tab-content">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛍️</div>
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 28,
                  color: "var(--maroon)",
                }}
              >
                {editIdx !== null ? "Edit Product" : "Add a New Product"}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Upload Images */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
                    Upload Product Images
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setImageFiles(files);
                      setImages(files.map((f) => URL.createObjectURL(f)));
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                        onMouseEnter={() => setHoverImg(img)}
                        onMouseLeave={() => setHoverImg(null)}
                      />
                    ))}
                  </div>
                  <p>Max 5 and min 1</p>
                </div>

                {/* Name */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Product Name</div>
                  <input
                    className="form-control"
                    placeholder="e.g. Handmade Terracotta Horse"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={{ fontSize: 17, padding: "14px 16px" }}
                  />
                </div>

                {/* Category */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Category</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {Array.isArray(catOptions) &&
                      catOptions.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => setSelectedCat(c)}
                          style={{
                            padding: "12px 8px",
                            borderRadius: 10,
                            cursor: "pointer",
                            border: selectedCat?._id === c._id ? "2px solid var(--gold)" : "2px solid var(--border)",
                            textAlign: "center",
                            background: selectedCat?._id === c._id ? "var(--gold-pale)" : "white",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{c.emoji}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Price & Stock */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Price & Stock</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      ["price", "💰 Selling Price (₹)", "e.g. 1200"],
                      ["originPrice", "💰 Original Price (₹)", "e.g. 1500"],
                      ["stock", "📦 Units in Stock", "e.g. 10"],
                    ].map(([key, label, ph]) => (
                      <div key={key}>
                        <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                          {label}
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder={ph}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* District */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Your District</div>
                  <select
                    className="filter-select"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  >
                    <option value="">Select your district</option>
                    {Array.isArray(WB_DISTRICTS) &&
                      WB_DISTRICTS.map((d) => <option key={d}>📍 {d}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Description</div>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe your product..."
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  />
                </div>

                <button className="btn-gold" style={{ padding: 18, fontSize: 16 }} onClick={saveProduct}>
                  {editIdx !== null ? "💾 Save Changes" : "🚀 Publish Product"}
                </button>
              </div>

              {/* Live Preview */}
              <div style={{ position: "sticky", top: 90 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 12,
                  }}
                >
                  Live Preview
                </div>
                <div
                  style={{
                    background: "white",
                    border: "2px solid var(--gold)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  <div
                    style={{
                      height: 280,
                      background: "linear-gradient(135deg,var(--cream2),var(--gold-pale))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 80,
                    }}
                  >
                    {images.length ? (
                      <img
                        src={hoverImg || images[0]}
                        alt="preview"
                        style={{ height: "100%", width: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ fontSize: 80 }}>{selectedEmoji}</div>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {selectedCat?.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 18,
                        color: form.name ? "var(--maroon)" : "var(--text-muted)",
                        marginBottom: 8,
                        fontStyle: form.name ? "normal" : "italic",
                      }}
                    >
                      {form.name || "Your product name..."}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: form.price ? "var(--green)" : "var(--text-muted)",
                      }}
                    >
                      {form.price ? `₹${parseInt(form.price).toLocaleString()}` : "₹ —"}
                    </div>
                    {form.stock && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        📦 {form.stock} in stock
                      </div>
                    )}
                    {form.district && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        📍 {form.district}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="dash-tab-content">
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              color: "var(--maroon)",
              marginBottom: 24,
            }}
          >
            Recent Orders
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "var(--shadow)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--maroon)", color: "var(--gold-pale)" }}>
                  {["Order ID", "Product", "Customer", "Amount", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 16px",
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: i % 2 === 0 ? "white" : "var(--cream)",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--maroon)", fontSize: 13 }}>
                      {o.id}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.product}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{o.customer}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
                      ₹{o.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{o.date}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background:
                            o.status === "delivered"
                              ? "var(--green)"
                              : o.status === "shipped"
                              ? "#1565c0"
                              : "var(--gold)",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ── Reports Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div style={{ padding: "24px 32px", maxWidth: 1000, margin: "0 auto" }}>
          <h3 style={{ color: "var(--gold-light)", marginBottom: 20 }}>📊 Order Reports</h3>

          {/* Filter */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(245,228,184,0.7)", marginBottom: 4 }}>From</label>
              <input
                type="date"
                value={reportRange.startDate}
                onChange={(e) => setReportRange((r) => ({ ...r, startDate: e.target.value }))}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(245,228,184,0.7)", marginBottom: 4 }}>To</label>
              <input
                type="date"
                value={reportRange.endDate}
                onChange={(e) => setReportRange((r) => ({ ...r, endDate: e.target.value }))}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
              />
            </div>
            <button
              onClick={loadReport}
              disabled={reportLoading}
              style={{ padding: "10px 20px", background: "var(--gold)", color: "var(--maroon)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
            >
              {reportLoading ? "Loading…" : "Generate Report"}
            </button>
          </div>

          {reportData && (
            <>
              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Total Orders", value: reportData.totalOrders, icon: "📋" },
                  { label: "Total Revenue", value: `₹${reportData.totalRevenue?.toLocaleString()}`, icon: "💰" },
                  { label: "Refunds Issued", value: `₹${reportData.refundTotal?.toLocaleString()}`, icon: "🔄" },
                  { label: "Net Revenue", value: `₹${(reportData.totalRevenue - reportData.refundTotal)?.toLocaleString()}`, icon: "📈" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,0.07)", borderRadius: 12,
                    padding: "16px 20px", textAlign: "center", border: "1px solid rgba(200,146,42,0.2)",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-light)" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "rgba(245,228,184,0.6)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, border: "1px solid rgba(200,146,42,0.2)" }}>
                  <h4 style={{ color: "var(--gold)", marginBottom: 12 }}>Order Status</h4>
                  {Object.entries(reportData.statusBreakdown || {}).map(([status, count]) => (
                    <div key={status} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(245,228,184,0.8)", marginBottom: 6 }}>
                      <span>{status}</span><span style={{ fontWeight: 700 }}>{count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, border: "1px solid rgba(200,146,42,0.2)" }}>
                  <h4 style={{ color: "var(--gold)", marginBottom: 12 }}>Payment Methods</h4>
                  {Object.entries(reportData.paymentBreakdown || {}).map(([method, count]) => (
                    <div key={method} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(245,228,184,0.8)", marginBottom: 6 }}>
                      <span>{method}</span><span style={{ fontWeight: 700 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(200,146,42,0.15)" }}>
                      {["Order ID","Customer","Subtotal","Discount","GST","Plat.Fee","Delivery","Total","Method","Payment","Status","Date"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--gold)", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.orders?.map((o) => (
                      <tr key={o._id} style={{ borderBottom: "1px solid rgba(200,146,42,0.1)" }}>
                        <td style={{ padding: "10px 14px", color: "rgba(245,228,184,0.7)", fontSize: 11 }}>{o._id?.slice(-8)}</td>
                        <td style={{ padding: "10px 14px", color: "rgba(245,228,184,0.9)" }}>{o.user?.name || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "var(--gold)", fontWeight: 700 }}>₹{o.totalAmount?.toLocaleString()}</td>
                        <td style={{ padding: "10px 14px", color: "rgba(245,228,184,0.8)" }}>{o.paymentMethod}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                            background: o.paymentStatus === "Paid" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                            color: o.paymentStatus === "Paid" ? "#22c55e" : "#ef4444",
                          }}>{o.paymentStatus}</span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                            background: "rgba(200,146,42,0.15)", color: "var(--gold)",
                          }}>{o.status}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "rgba(245,228,184,0.6)", fontSize: 11 }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!reportData && !reportLoading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(245,228,184,0.5)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <p>Select a date range and click Generate Report</p>
            </div>
          )}
        </div>
      )}

      {/* ── Refunds Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "refunds" && (
        <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
          <h3 style={{ color: "var(--gold-light)", marginBottom: 20 }}>🔄 Refund Requests</h3>

          {refunds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(245,228,184,0.5)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p>No pending refund requests</p>
            </div>
          ) : (
            refunds.map((r) => (
              <div key={r._id} style={{
                background: "rgba(255,255,255,0.06)", borderRadius: 12,
                padding: "20px 24px", marginBottom: 16, border: "1px solid rgba(200,146,42,0.2)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(245,228,184,0.5)" }}>Order ID</div>
                    <div style={{ fontWeight: 700, color: "var(--gold-light)", fontSize: 14 }}>{r._id?.slice(-12)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(245,228,184,0.5)" }}>Customer</div>
                    <div style={{ color: "rgba(245,228,184,0.9)" }}>{r.user?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "rgba(245,228,184,0.5)" }}>{r.user?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(245,228,184,0.5)" }}>Refund Amount</div>
                    <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 18 }}>₹{r.refundAmount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(245,228,184,0.5)" }}>Status</div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: r.refundStatus === "Requested" ? "rgba(255,193,7,0.2)" : r.refundStatus === "Processed" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                      color: r.refundStatus === "Requested" ? "#ffc107" : r.refundStatus === "Processed" ? "#22c55e" : "#ef4444",
                    }}>{r.refundStatus}</span>
                  </div>
                </div>

                {r.refundReason && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "rgba(245,228,184,0.7)", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 6 }}>
                    <b>Reason:</b> {r.refundReason}
                  </div>
                )}

                {r.refundStatus === "Requested" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                      onClick={() => handleRefundAction(r._id, "approve")}
                      style={{ padding: "9px 18px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                    >
                      ✅ Approve Refund
                    </button>
                    <button
                      onClick={() => handleRefundAction(r._id, "reject")}
                      style={{ padding: "9px 18px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                    >
                      ❌ Reject
                    </button>
                    <span style={{ fontSize: 11, color: "rgba(245,228,184,0.4)", alignSelf: "center" }}>
                      Transfer ₹{r.refundAmount?.toLocaleString()} to customer's UPI manually after approval
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default DashboardPage;
