import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import eagleLogo from '/src/assets/eagle-logo.png';


const API_URL = import.meta.env.VITE_API_URL;

const OwnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  

  const navigate = useNavigate();

  const handleOwnerForgot = async () => {
    if (!forgotEmail) {
      alert("Enter registered email");
      return;
    }

    const response = await fetch(
      `${API_URL}/auth/send-owner-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {

      setOtpSent(true);

      alert("OTP sent to email");

    }
  };

  const verifyOwnerOtp = async () => {

    const newPassword = prompt(
      "Enter New Password"
    );

    if (!newPassword) return;

    const response = await fetch(
      `${API_URL}/auth/verify-owner-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: enteredOtp,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {

      alert(
        "Password Reset Successful ✅"
      );

      setShowForgotModal(false);

    } else {

      alert(data.message);

    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("ownerRememberedEmail");
    const savedRemember = localStorage.getItem("ownerRememberMe");

    if (
      savedRemember === "true" &&
      savedEmail
    ) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {

        // SAVE TOKEN
        localStorage.setItem("token", data.token);

        // SAVE USER
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // REMEMBER ME
        if (rememberMe) {

          localStorage.setItem(
            "ownerRememberedEmail",
            email
          );
          localStorage.setItem(
            "ownerRememberMe",
            "true"
          );

        } else {

          localStorage.removeItem(
            "ownerRememberedEmail"
          );

          localStorage.removeItem(
            "ownerRememberMe"
          );
        }

        navigate("/owner/dashboard");

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOne}></div>
      <div style={styles.bgGlowTwo}></div>

      <div style={styles.card}>
        <div style={styles.topIconWrap}>
          <div style={styles.logoWrap}>
              <img src={eagleLogo} alt="Eagle Transport Logo" style={styles.logo} />
          </div>
        </div>

        <h2 style={styles.title}>Owner Login</h2>
        <p style={styles.subtitle}>Secure access to Eagle Transport Owner Dashboard</p>

        <div style={styles.secureNote}>
          <ShieldCheck size={16} />
          <span>Protected admin access</span>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>

            <div style={styles.inputWrap}>
              <Mail size={18} color="#64748b" />

              <input
                type="email"
                placeholder="Enter Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={18} color="#64748b" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          

          <div style={styles.optionsRow}>
            <label style={styles.rememberWrap}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Remember me</span>
            </label>
          </div>

          <div style={styles.optionsRow}>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={styles.ownerForgotBtn}
            >
              Forgot Password?
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}


          <button type="submit" style={styles.button}>
            Login to Dashboard
          </button>
          {showForgotModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h3 style={styles.modalTitle}>
                  Recover Password
                </h3>

                <input
                  type="email"
                  placeholder="Enter Registered Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={styles.modalInput}
                />

                {!otpSent ? (
                  <button
                    onClick={handleOwnerForgot}
                    style={styles.modalBtn}
                  >
                    Send OTP
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      style={styles.modalInput}
                    />

                    <button
                      onClick={verifyOwnerOtp}
                      style={styles.modalBtn}
                    >
                      Verify OTP
                    </button>
                  </>
                )}

                
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setOtpSent(false);
                    setForgotEmail('');
                    setEnteredOtp('');
                  
                  }}
                  style={styles.closeBtn}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0b2342 0%, #102f57 45%, #1e5fa3 100%)',
  },

  bgGlowOne: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(255, 140, 26, 0.18)',
    top: '-60px',
    left: '-40px',
    filter: 'blur(10px)',
  },

  bgGlowTwo: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    bottom: '-100px',
    right: '-60px',
    filter: 'blur(10px)',
  },

  card: {
    width: '100%',
    maxWidth: '430px',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(10px)',
    padding: '36px 32px',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    border: '1px solid rgba(255,255,255,0.3)',
  },

  topIconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '18px',
  },

  topIcon: {
    width: '68px',
    height: '68px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: '0 16px 30px rgba(255, 140, 26, 0.28)',
  },

  title: {
    margin: 0,
    color: '#0f3057',
    fontSize: '2rem',
    fontWeight: '800',
  },

  subtitle: {
    color: '#64748b',
    margin: '10px 0 16px',
    fontSize: '0.96rem',
    lineHeight: '1.6',
  },

  secureNote: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#eff6ff',
    color: '#12386d',
    border: '1px solid #d8e8ff',
    padding: '9px 14px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '0.84rem',
    marginBottom: '24px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: '#0f3057',
  },

  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #dbe4ef',
    borderRadius: '16px',
    padding: '0 14px',
    background: '#fff',
    minHeight: '54px',
    boxShadow: '0 4px 10px rgba(10, 35, 66, 0.03)',
  },

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    height: '52px',
    fontSize: '1rem',
    background: 'transparent',
    color: '#0f3057',
  },

  eyeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '2px',
  },

  rememberWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.92rem',
    color: '#334155',
    cursor: 'pointer',
  },

  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#0f4a88',
  },

  hintText: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: '600',
  },

  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    marginTop: '4px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '1rem',
    boxShadow: '0 12px 24px rgba(15, 74, 136, 0.20)',
  },

  error: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    fontSize: '14px',
    padding: '12px',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: '700',
  },

  bottomNote: {
    marginTop: '6px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.88rem',
  },

  logoWrap: {
  width: '78px',
  height: '78px',
  borderRadius: '20px',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 16px 30px rgba(0,0,0,0.15)',
  border: '1px solid rgba(0,0,0,0.05)',
},

logo: {
  width: '100px',
  height: '100px',
  objectFit: 'contain',
},
  errorText: {
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "-10px",
  },

  forgotWrap: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
  },

  forgotBtn: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "14px",
  },

  ownerForgotBtn: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "14px",
    background: 'linear-gradient(135deg, #0f4a88 0%, #143d73 100%)',
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(239,68,68,0.25)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modalCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "28px",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  modalTitle: {
    margin: 0,
    color: "#0f3057",
    fontSize: "24px",
    fontWeight: "900",
    textAlign: "center",
  },

  modalInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #dbe4ef",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  modalBtn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },

  generatedBox: {
    background: "#eff6ff",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #bfdbfe",
    color: "#0f172a",
    fontWeight: "700",
  },

  closeBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "14px",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default OwnerLogin;