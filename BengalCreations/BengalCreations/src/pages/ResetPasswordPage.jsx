import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/api";

function ResetPasswordPage({ showToast }) {
  const { customerId, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirm) { showToast("⚠️ Please fill all fields"); return; }
    if (newPassword.length < 6) { showToast("⚠️ Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { showToast("⚠️ Passwords do not match"); return; }

    try {
      setLoading(true);
      await resetPassword(customerId, token, newPassword);
      setDone(true);
      showToast("✅ Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--maroon-dark), var(--maroon))" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>🔐</div>
          <h2 style={{ color: "var(--maroon)", margin: "10px 0 4px" }}>Reset Password</h2>
          <p style={{ color: "#888", fontSize: 14 }}>Enter your new password below</p>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 50 }}>✅</div>
            <h3 style={{ color: "var(--maroon)" }}>Password Reset!</h3>
            <p style={{ color: "#555" }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-control"
                  type={showPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: 40 }}
                />
                <button onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888" }}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label style={{ fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Confirm Password</label>
              <input
                className="form-control"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>

            <button
              className="btn-gold"
              onClick={handleReset}
              disabled={loading}
              style={{ width: "100%", marginTop: 24, padding: "13px 0", fontSize: 16 }}
            >
              {loading ? "Resetting..." : "Reset Password →"}
            </button>

            <p style={{ textAlign: "center", marginTop: 16 }}>
              <span onClick={() => navigate("/login")} style={{ color: "var(--maroon)", cursor: "pointer", fontSize: 14 }}>← Back to Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
