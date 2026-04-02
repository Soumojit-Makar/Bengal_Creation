import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { uploadImage } from "../utils/cloudinary";
import {
  loginCustomer as apiLoginCustomer,
  loginVendor as apiLoginVendor,
  registerCustomer as apiRegisterCustomer,
  registerVendor as apiRegisterVendor,
  createAddress,
  forgotPassword as apiForgotPassword,
  googleLoginCustomer,
  googleLoginVendor,
} from "../api/api";

function LoginPage({ onLogin, showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("customer");
  const [authMode, setAuthMode] = useState("signin"); // signin | register | forgot
  const [si, setSi] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    name: "", email: "", phone: "", password: "",
    store: "", description: "", address: "",
    logo: null, banner: null, tradeLicense: null,
    aadhaarCard: null, panCard: null, otherDoc: null,
  });
  const [showPwd, setShowPwd] = useState({ si: false, reg: false });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const setFile = (name, file) => setReg((r) => ({ ...r, [name]: file }));
  const [form, setForm] = useState({
    address: "", city: "", pin: "", state: "", houseNo: "", landmark: "",
  });

  const addAddress = async ({ user_id }) => {
    try {
      if (!user_id) return;
      await createAddress({
        customer: user_id,
        fullName: reg.name,
        phone: reg.phone,
        pincode: form.pin,
        city: form.city,
        area: form.address,
        state: form.state,
        houseNo: form.houseNo,
        landmark: form.landmark,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Sign In ──────────────────────────────────────────────────────────────────
  const doSignIn = async () => {
    if (!si.email || !si.password) {
      showToast("⚠️ Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (role === "customer") {
        const data = await apiLoginCustomer(si);
        data.user.role = "customer";
        showToast("User Successfully Login");
        onLogin(data.user);
        navigate("/");
      } else {
        const data = await apiLoginVendor(si);
        data.vendor.role = "vendor";
        showToast("Vendor Successfully Login");
        onLogin(data.vendor);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };
    // ── Google Login ─────────────────────────────────────────────────────────────
  const doGoogleLogin = useCallback(async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      const data = await googleLoginCustomer(credentialResponse.credential);
      data.user.role = "customer";
      showToast(`Welcome, ${data.user.name}!`);
      onLogin(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [navigate, onLogin, showToast]);

  const doVendorGoogleLogin = useCallback(async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      const data = await googleLoginVendor(credentialResponse.credential);
      data.vendor.role = "vendor";
      showToast(`Welcome back, ${data.vendor.name}!`);
      onLogin(data.vendor);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [navigate, onLogin, showToast]);
 
  // ── Forgot Password ───────────────────────────────────────────────────────────
  const doForgotPassword = async () => {
    if (!forgotEmail) { showToast("⚠️ Please enter your email"); return; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);
    if (!emailOk) { showToast("⚠️ Invalid email address"); return; }
    try {
      setLoading(true);
      await apiForgotPassword(forgotEmail);
      setForgotSent(true);
      showToast("✅ Password reset email sent!");
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────────
  const doRegister = async () => {
    if (!reg.name || !reg.email || !reg.password) {
      showToast("⚠️ Please fill all required fields");
      return;
    }
    if (reg.password.length < 6) {
      showToast("⚠️ Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (role === "customer") {
        const data = await apiRegisterCustomer({
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          password: reg.password,
        });
        const user_id = data.user._id;
        await addAddress({ user_id });
        showToast("Customer Registered!");
      } else {
        const vendorData = {
          name: reg.name,
          shopName: reg.store,
          email: reg.email,
          phone: reg.phone,
          password: reg.password,
          description: reg.description,
          address: reg.address,
          logo: await uploadImage(reg.logo),
          banner: await uploadImage(reg.banner),
          tradeLicense: await uploadImage(reg.tradeLicense),
          aadhaarCard: await uploadImage(reg.aadhaarCard),
          panCard: await uploadImage(reg.panCard),
          otherDoc: reg.otherDoc ? await uploadImage(reg.otherDoc) : null,
        };
        await apiRegisterVendor(vendorData);
        showToast("Vendor Registered! Waiting for approval.");
        setAuthMode("signin");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lblStyle = { fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <h2>Bengal Creations</h2>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(245,228,184,0.5)", textTransform: "uppercase", marginTop: 2 }}>
            Heritage Handcrafted
          </div>
        </div>

        {/* Role Tabs — hide on forgot password screen */}
        {authMode !== "forgot" && (
          <div className="role-tabs">
            {[["customer", "👤 Customer"], ["vendor", "🏪 Vendor"]].map(([r, label]) => (
              <button key={r} className="role-tab"
                style={{ background: role === r ? "white" : "transparent", color: role === r ? "#7a1c2e" : "rgba(245,228,184,0.6)" }}
                onClick={() => setRole(r)}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Auth Mode Tabs */}
        {authMode !== "forgot" && (
          <div className="auth-tabs">
            {[["signin", "Sign In"], ["register", "Create Account"]].map(([m, label]) => (
              <button key={m} className="auth-tab"
                style={{ borderBottomColor: authMode === m ? "#c8922a" : "transparent", color: authMode === m ? "#e5b84a" : "rgba(245,228,184,0.45)" }}
                onClick={() => setAuthMode(m)}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="login-card">

          {/* ── Forgot Password ── */}
          {authMode === "forgot" && (
            <div>
              <h3>🔐 Forgot Password</h3>
              {forgotSent ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48 }}>📧</div>
                  <p style={{ color: "#555", marginTop: 12 }}>
                    A password reset link has been sent to <b>{forgotEmail}</b>.<br />
                    Please check your inbox.
                  </p>
                  <button className="login-submit-btn" style={{ marginTop: 16 }} onClick={() => { setAuthMode("signin"); setForgotSent(false); }}>
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: "#777", fontSize: 14, marginBottom: 18 }}>
                    Enter your registered email address and we'll send you a password reset link.
                  </p>
                  <div>
                    <label style={lblStyle}>Email Address</label>
                    <input className="form-control" type="email" placeholder="you@email.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && doForgotPassword()}
                    />
                  </div>
                  <button className="login-submit-btn" onClick={doForgotPassword} disabled={loading} style={{ marginTop: 18 }}>
                    {loading ? "Sending..." : "Send Reset Link →"}
                  </button>
                  <p style={{ textAlign: "center", marginTop: 14 }}>
                    <button style={{ background: "none", border: "none", color: "#6b5744", cursor: "pointer", fontSize: 13 }}
                      onClick={() => setAuthMode("signin")}>
                      ← Back to Sign In
                    </button>
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Sign In ── */}
          {authMode === "signin" && (
            <div>
              <h3>Welcome back</h3>
              <p>Sign in to your {role} account</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lblStyle}>Email</label>
                  <input className="form-control" type="email" placeholder="you@email.com"
                    value={si.email} onChange={(e) => setSi((s) => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <label style={lblStyle}>Password</label>
                  <div className="login-input-wrap">
                    <input className="form-control" type={showPwd.si ? "text" : "password"}
                      placeholder="Your password" style={{ paddingRight: 48 }}
                      value={si.password}
                      onChange={(e) => setSi((s) => ({ ...s, password: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && doSignIn()} />
                    <button type="button" className="toggle-pwd" onClick={() => setShowPwd((s) => ({ ...s, si: !s.si }))}>👁</button>
                  </div>
                  {/* Forgot password link — only for customers */}
                  {role === "customer" && (
                    <div style={{ textAlign: "right", marginTop: 6 }}>
                      <button style={{ background: "none", border: "none", color: "#c8922a", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        onClick={() => { setAuthMode("forgot"); setForgotSent(false); setForgotEmail(""); }}>
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
                <button className="login-submit-btn" onClick={doSignIn} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
                <div style={{ marginTop: 18, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(107,87,68,0.25)" }} />
                    <span style={{ fontSize: 12, color: "#6b5744", fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(107,87,68,0.25)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {role === "customer" ? (
                      <GoogleLogin
                        onSuccess={doGoogleLogin}
                        onError={() => showToast("❌ Google sign-in failed")}
                        text="signin_with"
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        logo_alignment="left"
                      />
                    ) : (
                      <GoogleLogin
                        onSuccess={doVendorGoogleLogin}
                        onError={() => showToast("❌ Google sign-in failed")}
                        text="signin_with"
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        logo_alignment="left"
                      />
                    )}
                  </div>
                  {role === "vendor" && (
                    <p style={{ fontSize: 11, color: "rgba(245,228,184,0.45)", marginTop: 8 }}>
                      Google login links to your existing vendor account
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Register ── */}
          {authMode === "register" && (
            <div>
              <h3>Create account</h3>
              <p>Join Bengal Creations as a {role}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {role === "vendor" && (
                  <>
                    {[
                      ["store", "Store Name", "text", "e.g. Bishnupur Crafts House"],
                      ["description", "Store Description", "textarea", "Briefly describe your store"],
                      ["address", "Store Address", "textarea", "Enter your store's physical address"],
                    ].map(([key, label, type, ph]) => (
                      <div key={key}>
                        <label style={lblStyle}>{label} <span className="req">*</span></label>
                        {type === "textarea" ? (
                          <textarea className="form-control" placeholder={ph} value={reg[key]}
                            onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))} rows={3} />
                        ) : (
                          <input className="form-control" placeholder={ph} value={reg[key]}
                            onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))} />
                        )}
                      </div>
                    ))}
                    <div>
                      <label style={lblStyle}>Upload Store Logo</label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => setFile("logo", e.target.files[0])} />
                    </div>
                    <div>
                      <label style={lblStyle}>Upload Store Banner</label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => setFile("banner", e.target.files[0])} />
                    </div>
                  </>
                )}

                {[
                  ["name", "Full Name", "text", "Your full name"],
                  ["email", "Email", "email", "you@email.com"],
                  ["phone", "Mobile", "tel", "10-digit number"],
                ].map(([key, label, type, ph]) => (
                  <div key={key}>
                    <label style={lblStyle}>{label} <span className="req">*</span></label>
                    <input className="form-control" type={type} placeholder={ph} value={reg[key]}
                      onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))} />
                  </div>
                ))}

                <div>
                  <label style={lblStyle}>Password <span className="req">*</span></label>
                  <div className="login-input-wrap">
                    <input className="form-control" type={showPwd.reg ? "text" : "password"}
                      placeholder="Minimum 6 characters" style={{ paddingRight: 48 }}
                      value={reg.password} onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))} />
                    <button type="button" className="toggle-pwd" onClick={() => setShowPwd((s) => ({ ...s, reg: !s.reg }))}>👁</button>
                  </div>

                  {role === "customer" && (
                    <div className="form-grid">
                      {[
                        ["houseNo", "House / Flat / Office No.", "text"],
                        ["address", "Street Address / Colony", "text"],
                        ["landmark", "Landmark (Optional)", "text"],
                        ["city", "City", "text"],
                        ["state", "State", "text"],
                        ["pin", "PIN Code", "text"],
                      ].map(([key, label, type]) => (
                        <div key={key} className={`form-group${key === "address" ? " full" : ""}`}>
                          {key === "landmark" ? <label>{label}</label> : <label>{label} <span className="req">*</span></label>}
                          <input className="form-control" type={type} value={form[key]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {role === "vendor" && (
                  <>
                    {[
                      ["tradeLicense", "Trade License Doc (only PDF)", "application/pdf"],
                      ["aadhaarCard", "Aadhaar Card (only PDF)", "application/pdf"],
                      ["panCard", "PAN Card (only PDF)", "application/pdf"],
                      ["otherDoc", "Other Document (optional)", "application/pdf,image/*"],
                    ].map(([key, label, accept]) => (
                      <div key={key}>
                        <label style={lblStyle}>{label}{key !== "otherDoc" && <span className="req"> *</span>}</label>
                        <input className="form-control" type="file" accept={accept} onChange={(e) => setFile(key, e.target.files[0])} />
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "#6b5744", background: "#f5e4b8", padding: 10, borderRadius: 4 }}>
                      <strong>Vendor Registration Notice:</strong><br />
                      By creating a vendor account, you agree to provide authentic products and accurate information.
                      Your account will be reviewed and approved by our team before you can start selling.
                    </div>
                  </>
                )}

                <button className="login-submit-btn" onClick={doRegister} disabled={loading}>
                  {loading ? "Creating…" : "Create Account →"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button style={{ background: "transparent", border: "none", color: "rgba(245,228,184,0.5)", fontSize: 13, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
