import { useState, useEffect } from "react";
import { fetchAddresses, createAddress, updateAddress, deleteAddress, changePassword } from "../api/api";

const EMPTY_ADDR = { fullName: "", phone: "", houseNo: "", area: "", city: "", state: "", pincode: "", landmark: "" };

function ProfilePage({ currentUser, showToast }) {
  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [editingAddr, setEditingAddr] = useState(null); // null = none, "new" = add form, id = edit form
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);

  // Password change
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ cur: false, new: false, con: false });
  const [activeTab, setActiveTab] = useState("addresses");

  useEffect(() => {
    if (currentUser?._id) {
      fetchAddresses(currentUser._id)
        .then(setAddresses)
        .catch(() => showToast("Failed to load addresses"))
        .finally(() => setLoadingAddr(false));
    }
  }, [currentUser]);

  const openAddForm = () => { setAddrForm(EMPTY_ADDR); setEditingAddr("new"); };
  const openEditForm = (addr) => {
    setAddrForm({
      fullName: addr.fullName || "", phone: addr.phone || "",
      houseNo: addr.houseNo || "", area: addr.area || "",
      city: addr.city || "", state: addr.state || "",
      pincode: addr.pincode || "", landmark: addr.landmark || "",
    });
    setEditingAddr(addr._id);
  };

  const saveAddress = async () => {
    const required = ["fullName", "phone", "houseNo", "area", "city", "state", "pincode"];
    if (required.some(k => !addrForm[k])) { showToast("⚠️ Please fill all required fields"); return; }

    try {
      if (editingAddr === "new") {
        const saved = await createAddress({ ...addrForm, customer: currentUser._id });
        setAddresses(prev => [...prev, saved]);
        showToast("✅ Address added!");
      } else {
        const updated = await updateAddress(editingAddr, addrForm);
        setAddresses(prev => prev.map(a => a._id === editingAddr ? updated : a));
        showToast("✅ Address updated!");
      }
      setEditingAddr(null);
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a._id !== id));
      showToast("🗑️ Address deleted");
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirm } = pwdForm;
    if (!currentPassword || !newPassword || !confirm) { showToast("⚠️ Fill all password fields"); return; }
    if (newPassword.length < 6) { showToast("⚠️ Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { showToast("⚠️ Passwords do not match"); return; }
    try {
      setPwdLoading(true);
      await changePassword(currentUser._id, currentPassword, newPassword);
      showToast("✅ Password changed successfully!");
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setPwdLoading(false);
    }
  };

  const styles = {
    page: { maxWidth: 860, margin: "40px auto", padding: "0 20px 60px" },
    header: { background: "linear-gradient(135deg, var(--maroon-dark), var(--maroon))", borderRadius: 16, padding: "32px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20 },
    avatar: { width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "3px solid rgba(255,255,255,0.4)" },
    name: { color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 },
    email: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
    tabs: { display: "flex", gap: 0, marginBottom: 24, borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--border)" },
    tab: (active) => ({ flex: 1, padding: "13px 20px", textAlign: "center", cursor: "pointer", fontWeight: 600, fontSize: 15, background: active ? "var(--maroon)" : "#fff", color: active ? "#fff" : "var(--maroon)", border: "none", transition: "all 0.2s" }),
    card: { background: "#fff", borderRadius: 14, padding: 24, border: "1.5px solid var(--border)", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
    addrLine: { color: "#555", fontSize: 14, lineHeight: 1.8 },
    addrActions: { display: "flex", gap: 10, marginTop: 14 },
    btnEdit: { background: "var(--maroon)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 },
    btnDel: { background: "#fff", color: "#c0392b", border: "1.5px solid #c0392b", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 },
    btnAdd: { background: "linear-gradient(135deg, var(--maroon-dark), var(--maroon))", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 8 },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" },
    label: { fontWeight: 600, color: "#444", display: "block", marginBottom: 5, fontSize: 13 },
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
    formBtns: { display: "flex", gap: 12, marginTop: 18, justifyContent: "flex-end" },
    btnSave: { background: "var(--maroon)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 600 },
    btnCancel: { background: "#f5f5f5", color: "#555", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 600 },
  };

  return (
    <div style={styles.page}>
      {/* Profile Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>👤</div>
        <div>
          <p style={styles.name}>{currentUser?.name || "My Profile"}</p>
          <p style={styles.email}>{currentUser?.email}</p>
          {currentUser?.phone && <p style={{ ...styles.email, marginTop: 2 }}>📱 {currentUser.phone}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === "addresses")} onClick={() => setActiveTab("addresses")}>📍 My Addresses</button>
        <button style={styles.tab(activeTab === "password")} onClick={() => setActiveTab("password")}>🔒 Change Password</button>
      </div>

      {/* ── Addresses Tab ── */}
      {activeTab === "addresses" && (
        <div>
          {editingAddr ? (
            <div style={styles.card}>
              <h3 style={{ color: "var(--maroon)", marginTop: 0, marginBottom: 20 }}>
                {editingAddr === "new" ? "➕ Add New Address" : "✏️ Edit Address"}
              </h3>
              <div style={styles.formGrid}>
                {[
                  ["fullName", "Full Name *"], ["phone", "Phone *"],
                  ["houseNo", "House / Flat No. *"], ["area", "Street / Area *"],
                  ["city", "City *"], ["state", "State *"],
                  ["pincode", "Pincode *"], ["landmark", "Landmark"],
                ].map(([key, label]) => (
                  <div key={key} style={key === "area" || key === "landmark" ? { gridColumn: "span 2" } : {}}>
                    <label style={styles.label}>{label}</label>
                    <input
                      style={styles.input}
                      value={addrForm[key]}
                      onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={label.replace(" *", "")}
                    />
                  </div>
                ))}
              </div>
              <div style={styles.formBtns}>
                <button style={styles.btnCancel} onClick={() => setEditingAddr(null)}>Cancel</button>
                <button style={styles.btnSave} onClick={saveAddress}>Save Address</button>
              </div>
            </div>
          ) : (
            <button style={styles.btnAdd} onClick={openAddForm}>➕ Add New Address</button>
          )}

          {loadingAddr ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading addresses...</div>
          ) : addresses.length === 0 && !editingAddr ? (
            <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40 }}>📍</div>
              <p style={{ color: "#888", marginTop: 10 }}>No addresses saved yet.</p>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr._id} style={styles.card}>
                <p style={{ fontWeight: 700, color: "#222", marginBottom: 6, fontSize: 15 }}>{addr.fullName}</p>
                <p style={styles.addrLine}>
                  {addr.houseNo}, {addr.area}<br />
                  {addr.city}, {addr.state} - {addr.pincode}<br />
                  {addr.landmark && `Near: ${addr.landmark}`}<br />
                  📞 {addr.phone}
                </p>
                <div style={styles.addrActions}>
                  <button style={styles.btnEdit} onClick={() => openEditForm(addr)}>✏️ Edit</button>
                  <button style={styles.btnDel} onClick={() => handleDeleteAddress(addr._id)}>🗑️ Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Change Password Tab ── */}
      {activeTab === "password" && (
        <div style={styles.card}>
          <h3 style={{ color: "var(--maroon)", marginTop: 0, marginBottom: 24 }}>🔒 Change Password</h3>
          {[
            ["currentPassword", "Current Password", "cur"],
            ["newPassword", "New Password", "new"],
            ["confirm", "Confirm New Password", "con"],
          ].map(([key, label, pwdKey]) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label style={styles.label}>{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd[pwdKey] ? "text" : "password"}
                  style={{ ...styles.input, paddingRight: 44 }}
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                />
                <button
                  onClick={() => setShowPwd(p => ({ ...p, [pwdKey]: !p[pwdKey] }))}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
                >
                  {showPwd[pwdKey] ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleChangePassword}
            disabled={pwdLoading}
            style={{ ...styles.btnSave, padding: "12px 32px", marginTop: 8, fontSize: 15 }}
          >
            {pwdLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
