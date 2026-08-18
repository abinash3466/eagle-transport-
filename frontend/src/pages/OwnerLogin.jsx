import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import eagleLogo from "/src/assets/eagle-logo.png";

const API_URL = import.meta.env.VITE_API_URL;

const OwnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [showForgotModal, setShowForgotModal] =
    useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");

  const navigate = useNavigate();

  /* =====================================================
     FORGOT PASSWORD - SEND OTP
  ===================================================== */

  const handleOwnerForgot = async () => {
    if (!forgotEmail) {
      alert("Enter registered email");
      return;
    }

    try {
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
      } else {
        alert(data.message || "Unable to send OTP");
      }
    } catch (error) {
      console.log(error);

      alert("Unable to send OTP");
    }
  };

  /* =====================================================
     VERIFY OTP + RESET PASSWORD
  ===================================================== */

  const verifyOwnerOtp = async () => {
    const newPassword = prompt(
      "Enter New Password"
    );

    if (!newPassword) return;

    try {
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

        setOtpSent(false);
        setForgotEmail("");
        setEnteredOtp("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Password reset failed");
    }
  };

  /* =====================================================
     REMEMBER EMAIL
  ===================================================== */

  useEffect(() => {
    const savedEmail =
      localStorage.getItem(
        "ownerRememberedEmail"
      );

    const savedRemember =
      localStorage.getItem(
        "ownerRememberMe"
      );

    if (
      savedRemember === "true" &&
      savedEmail
    ) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  /* =====================================================
     OWNER LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

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
        /* SAVE TOKEN */

        localStorage.setItem(
          "token",
          data.token
        );

        /* SAVE USER */

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        /* REMEMBER EMAIL */

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

        /* OWNER DASHBOARD */

        navigate("/owner/dashboard");
      } else {
        setError(
          data.message || "Invalid login"
        );

        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      setError(
        "Unable to connect to server"
      );

      alert("Login failed");
    }
  };

  return (
    <>
      {/* =================================================
          MOBILE CSS ONLY
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* ================================================
           OWNER LOGIN - MOBILE
        ================================================ */

        @media (max-width: 768px) {

          .owner-login-page {
  min-height: auto !important;
  height: auto !important;

  padding: 18px 16px 24px !important;

  align-items: flex-start !important;

  overflow-y: visible !important;

  background:
    linear-gradient(
      145deg,
      #071d38 0%,
      #0b315d 52%,
      #15548f 100%
    ) !important;
}


/* ================= CARD ================= */

.owner-login-card {
  width: 100% !important;
  max-width: 350px !important;

  margin: 5px auto 0 !important;

  padding: 21px 19px 19px !important;

  border-radius: 23px !important;

  background:
    rgba(255, 255, 255, 0.98) !important;

  border:
    1px solid rgba(255, 255, 255, 0.65) !important;

  box-shadow:
    0 18px 45px rgba(0, 20, 45, 0.24) !important;

  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}


          /* ================= LOGO ================= */

          .owner-login-top-icon {
            margin-bottom:
              10px !important;
          }

          .owner-login-logo-wrap {
            width: 60px !important;
            height: 60px !important;

            margin: 0 auto !important;

            border-radius:
              17px !important;

            box-shadow:
              0 10px 25px
              rgba(8,45,80,0.13) !important;
          }

          .owner-login-logo {
            width: 72px !important;
            height: 72px !important;

            object-fit: contain !important;
          }


          /* ================= TITLE ================= */

          .owner-login-title {
            margin:
              11px 0 0 !important;

            font-size:
              27px !important;

            line-height:
              1.05 !important;

            letter-spacing:
              -0.6px !important;

            color:
              #0b315d !important;
          }


          /* ================= SUB TITLE ================= */

          .owner-login-subtitle {
            max-width:
              260px !important;

            margin:
              7px auto 11px !important;

            font-size:
              11.5px !important;

            line-height:
              1.45 !important;

            color:
              #6b7f99 !important;
          }


          /* ================= SECURITY ================= */

          .owner-login-secure {
            margin:
              0 auto 15px !important;

            padding:
              6px 10px !important;

            gap:
              6px !important;

            font-size:
              9.5px !important;

            border-radius:
              999px !important;
          }

          .owner-login-secure svg {
            width:
              13px !important;

            height:
              13px !important;
          }


          /* ================= FORM ================= */

          .owner-login-form {
            gap:
              11px !important;
          }


          /* ================= LABEL ================= */

          .owner-login-label {
            font-size:
              11px !important;

            font-weight:
              700 !important;

            color:
              #12375f !important;
          }


          /* ================= INPUT WRAPPER ================= */

          .owner-login-input-wrap {
            min-height:
              45px !important;

            padding:
              0 11px !important;

            gap:
              8px !important;

            border-radius:
              13px !important;

            border:
              1px solid
              #d9e4f0 !important;

            background:
              #ffffff !important;

            box-shadow:
              0 4px 12px
              rgba(9,42,78,0.04) !important;

            transition:
              border-color .2s ease,
              box-shadow .2s ease !important;
          }

          .owner-login-input-wrap:focus-within {
            border-color:
              #1a69b5 !important;

            box-shadow:
              0 0 0 3px
              rgba(26,105,181,0.08) !important;
          }

          .owner-login-input-wrap svg {
            width:
              16px !important;

            height:
              16px !important;

            flex-shrink: 0 !important;
          }


          /* ================= INPUT ================= */

          .owner-login-input {
            min-width:
              0 !important;

            height:
              43px !important;

            font-size:
              12.5px !important;
          }


          /* ================= OPTIONS ================= */

          .owner-login-options {
            margin-top:
              0 !important;

            gap:
              6px !important;
          }

          .owner-login-remember {
            gap:
              6px !important;

            font-size:
              10.5px !important;
          }


          /* ================= FORGOT ================= */

          .owner-login-forgot {
            padding:
              5px 8px !important;

            border-radius:
              8px !important;

            background:
              transparent !important;

            color:
              #1b5b9d !important;

            box-shadow:
              none !important;

            font-size:
              10.5px !important;

            font-weight:
              700 !important;
          }


          /* ================= LOGIN BUTTON ================= */

          .owner-login-submit {
            min-height:
              44px !important;

            margin-top:
              1px !important;

            padding:
              0 14px !important;

            border-radius:
              13px !important;

            background:
              linear-gradient(
                135deg,
                #125c9f,
                #103b6d
              ) !important;

            font-size:
              12.5px !important;

            font-weight:
              800 !important;

            box-shadow:
              0 9px 20px
              rgba(15,74,136,0.20) !important;
          }


          /* ================= MODAL ================= */

          .owner-forgot-modal {
            width:
              calc(100% - 30px) !important;

            max-width:
              340px !important;

            padding:
              20px 16px !important;

            border-radius:
              20px !important;
          }

          .owner-forgot-modal-title {
            font-size:
              20px !important;
          }

          .owner-forgot-modal-input {
            padding:
              11px 12px !important;

            border-radius:
              11px !important;

            font-size:
              12px !important;
          }

          .owner-forgot-modal-btn {
            min-height:
              42px !important;

            padding:
              0 12px !important;

            border-radius:
              11px !important;

            font-size:
              12px !important;
          }

        }


        /* ================================================
           SMALL MOBILE
        ================================================ */

        @media (max-width: 420px) {

          .owner-login-page {
            padding:
              14px 12px !important;
          }

          .owner-login-card {
            max-width:
              335px !important;

            padding:
              18px 16px 17px !important;

            border-radius:
              21px !important;
          }

          .owner-login-logo-wrap {
            width:
              56px !important;

            height:
              56px !important;
          }

          .owner-login-logo {
            width:
              65px !important;

            height:
              65px !important;
          }

          .owner-login-title {
            font-size:
              24px !important;
          }

          .owner-login-subtitle {
            max-width:
              240px !important;

            font-size:
              10.5px !important;
          }

          .owner-login-secure {
            margin-bottom:
              13px !important;

            font-size:
              9px !important;
          }

          .owner-login-form {
            gap:
              10px !important;
          }

          .owner-login-input-wrap {
            min-height:
              43px !important;
          }

          .owner-login-input {
            height:
              41px !important;

            font-size:
              12px !important;
          }

          .owner-login-submit {
            min-height:
              42px !important;

            font-size:
              12px !important;
          }
        }

        /* =========================================================
   MOBILE OWNER LOGIN
   BACKGROUND CLEAN FIX
========================================================= */

@media (max-width: 768px) {

  /* =========================================
     REMOVE ORANGE / WHITE BACKGROUND PATCHES
  ========================================= */

  .owner-login-bg-glow-one,
  .owner-login-bg-glow-two {
    display: none !important;
  }


  /* =========================================
     OWNER LOGIN FULL MOBILE BACKGROUND
  ========================================= */

  .owner-login-page {
    width: 100% !important;

    min-height: 100vh !important;

    height: auto !important;

    margin: 0 !important;

    padding:
      22px
      16px
      28px !important;

    position: relative !important;

    overflow-x: hidden !important;
    overflow-y: visible !important;

    background:
      linear-gradient(
        155deg,
        #061727 0%,
        #08253f 48%,
        #071d31 100%
      ) !important;
  }


  /* =========================================
     REMOVE WHITE AREA BELOW PAGE
  ========================================= */

  .main-content:has(.owner-login-page) {
    min-height: 100vh !important;

    background:
      linear-gradient(
        155deg,
        #061727 0%,
        #08253f 48%,
        #071d31 100%
      ) !important;
  }


  .page-wrapper:has(.owner-login-page) {
    background:
      #061727 !important;
  }


  /* =========================================
     CARD
  ========================================= */

  .owner-login-card {
    position: relative !important;

    z-index: 2 !important;

    width: 100% !important;

    max-width: 350px !important;

    margin:
      4px
      auto
      0 !important;

    border-radius:
      24px !important;

    background:
      linear-gradient(
        150deg,
        #0a263f 0%,
        #071f34 100%
      ) !important;

    border:
      1px solid
      rgba(
        116,
        172,
        225,
        0.14
      ) !important;

    box-shadow:
      0 22px 48px
      rgba(
        0,
        0,
        0,
        0.25
      ) !important;
  }

}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 420px) {

  .owner-login-page {
    min-height: 100vh !important;

    padding:
      16px
      12px
      24px !important;
  }

}

      `}</style>


      {/* =================================================
          LOGIN PAGE
      ================================================= */}

      <div
        className="owner-login-page"
        style={styles.page}
      >
        <div 
          className="owner-login-bg-glow-one" 
          style={styles.bgGlowOne}>
        </div>

        <div 
          style={styles.bgGlowTwo}
          className="owner-login-bg-glow-two">           
        </div>


        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
          className="owner-login-card"
          style={styles.card}
        >

          {/* LOGO */}

          <div
            className="owner-login-top-icon"
            style={styles.topIconWrap}
          >
            <div
              className="owner-login-logo-wrap"
              style={styles.logoWrap}
            >
              <img
                className="owner-login-logo"
                src={eagleLogo}
                alt="Eagle Transport Logo"
                style={styles.logo}
              />
            </div>
          </div>


          {/* TITLE */}

          <h2
            className="owner-login-title"
            style={styles.title}
          >
            Owner Login
          </h2>


          {/* SUBTITLE */}

          <p
            className="owner-login-subtitle"
            style={styles.subtitle}
          >
            Secure access to Eagle Transport
            Owner Dashboard
          </p>


          {/* SECURITY */}

          <div
            className="owner-login-secure"
            style={styles.secureNote}
          >
            <ShieldCheck size={16} />

            <span>
              Protected admin access
            </span>
          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="owner-login-form"
            onSubmit={handleLogin}
            style={styles.form}
          >

            {/* EMAIL */}

            <div style={styles.inputGroup}>
              <label
                className="owner-login-label"
                style={styles.label}
              >
                Email
              </label>

              <div
                className="owner-login-input-wrap"
                style={styles.inputWrap}
              >
                <Mail
                  size={18}
                  color="#64748b"
                />

                <input
                  className="owner-login-input"
                  type="email"
                  placeholder="Enter Registered Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  required
                />
              </div>
            </div>


            {/* PASSWORD */}

            <div style={styles.inputGroup}>
              <label
                className="owner-login-label"
                style={styles.label}
              >
                Password
              </label>

              <div
                className="owner-login-input-wrap"
                style={styles.inputWrap}
              >
                <Lock
                  size={18}
                  color="#64748b"
                />

                <input
                  className="owner-login-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>


            {/* REMEMBER */}

            <div
              className="owner-login-options"
              style={styles.optionsRow}
            >
              <label
                className="owner-login-remember"
                style={styles.rememberWrap}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  style={styles.checkbox}
                />

                <span>
                  Remember me
                </span>
              </label>
            </div>


            {/* FORGOT PASSWORD */}

            <div
              className="owner-login-options"
              style={styles.optionsRow}
            >
              <button
                className="owner-login-forgot"
                type="button"
                onClick={() =>
                  setShowForgotModal(
                    true
                  )
                }
                style={styles.ownerForgotBtn}
              >
                Forgot Password?
              </button>
            </div>


            {/* ERROR */}

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              className="owner-login-submit"
              type="submit"
              style={styles.button}
            >
              Login to Dashboard
            </button>


            {/* =================================================
                FORGOT PASSWORD MODAL
            ================================================= */}

            {showForgotModal && (
              <div
                style={styles.modalOverlay}
              >
                <div
                  className="owner-forgot-modal"
                  style={styles.modalCard}
                >

                  <h3
                    className="owner-forgot-modal-title"
                    style={styles.modalTitle}
                  >
                    Recover Password
                  </h3>


                  <input
                    className="owner-forgot-modal-input"
                    type="email"
                    placeholder="Enter Registered Email"
                    value={forgotEmail}
                    onChange={(e) =>
                      setForgotEmail(
                        e.target.value
                      )
                    }
                    style={styles.modalInput}
                  />


                  {!otpSent ? (
                    <button
                      className="owner-forgot-modal-btn"
                      type="button"
                      onClick={
                        handleOwnerForgot
                      }
                      style={styles.modalBtn}
                    >
                      Send OTP
                    </button>
                  ) : (
                    <>
                      <input
                        className="owner-forgot-modal-input"
                        type="text"
                        placeholder="Enter OTP"
                        value={enteredOtp}
                        onChange={(e) =>
                          setEnteredOtp(
                            e.target.value
                          )
                        }
                        style={
                          styles.modalInput
                        }
                      />

                      <button
                        className="owner-forgot-modal-btn"
                        type="button"
                        onClick={
                          verifyOwnerOtp
                        }
                        style={styles.modalBtn}
                      >
                        Verify OTP
                      </button>
                    </>
                  )}


                  <button
                    className="owner-forgot-modal-btn"
                    type="button"
                    onClick={() => {
                      setShowForgotModal(
                        false
                      );

                      setOtpSent(false);

                      setForgotEmail("");

                      setEnteredOtp("");
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
    </>
  );
};


/* =========================================================
   DESKTOP / DEFAULT STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: "24px",

    position: "relative",

    overflow: "hidden",

    background:
      "linear-gradient(135deg, #0b2342 0%, #102f57 45%, #1e5fa3 100%)",
  },


  bgGlowOne: {
    position: "absolute",

    width: "280px",

    height: "280px",

    borderRadius: "50%",

    background:
      "rgba(255, 140, 26, 0.18)",

    top: "-60px",

    left: "-40px",

    filter: "blur(10px)",
  },


  bgGlowTwo: {
    position: "absolute",

    width: "320px",

    height: "320px",

    borderRadius: "50%",

    background:
      "rgba(255, 255, 255, 0.08)",

    bottom: "-100px",

    right: "-60px",

    filter: "blur(10px)",
  },


  card: {
    width: "100%",

    maxWidth: "430px",

    background:
      "rgba(255,255,255,0.96)",

    backdropFilter: "blur(10px)",

    padding: "36px 32px",

    borderRadius: "28px",

    boxShadow:
      "0 24px 60px rgba(0,0,0,0.22)",

    textAlign: "center",

    position: "relative",

    zIndex: 2,

    border:
      "1px solid rgba(255,255,255,0.3)",
  },


  topIconWrap: {
    display: "flex",

    justifyContent: "center",

    marginBottom: "18px",
  },


  logoWrap: {
    width: "78px",

    height: "78px",

    borderRadius: "20px",

    background: "#fff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    boxShadow:
      "0 16px 30px rgba(0,0,0,0.15)",

    border:
      "1px solid rgba(0,0,0,0.05)",
  },


  logo: {
    width: "100px",

    height: "100px",

    objectFit: "contain",
  },


  title: {
    margin: 0,

    color: "#0f3057",

    fontSize: "2rem",

    fontWeight: "800",
  },


  subtitle: {
    color: "#64748b",

    margin: "10px 0 16px",

    fontSize: "0.96rem",

    lineHeight: "1.6",
  },


  secureNote: {
    display: "inline-flex",

    alignItems: "center",

    gap: "8px",

    background: "#eff6ff",

    color: "#12386d",

    border:
      "1px solid #d8e8ff",

    padding: "9px 14px",

    borderRadius: "999px",

    fontWeight: "600",

    fontSize: "0.84rem",

    marginBottom: "24px",
  },


  form: {
    display: "flex",

    flexDirection: "column",

    gap: "16px",

    textAlign: "left",
  },


  inputGroup: {
    display: "flex",

    flexDirection: "column",

    gap: "8px",
  },


  label: {
    fontSize: "0.92rem",

    fontWeight: "700",

    color: "#0f3057",
  },


  inputWrap: {
    display: "flex",

    alignItems: "center",

    gap: "10px",

    border:
      "1px solid #dbe4ef",

    borderRadius: "16px",

    padding: "0 14px",

    background: "#fff",

    minHeight: "54px",

    boxShadow:
      "0 4px 10px rgba(10, 35, 66, 0.03)",
  },


  input: {
    flex: 1,

    border: "none",

    outline: "none",

    height: "52px",

    fontSize: "1rem",

    background: "transparent",

    color: "#0f3057",
  },


  eyeBtn: {
    background: "transparent",

    border: "none",

    cursor: "pointer",

    color: "#64748b",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: 0,
  },


  optionsRow: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    gap: "12px",

    flexWrap: "wrap",

    marginTop: "2px",
  },


  rememberWrap: {
    display: "flex",

    alignItems: "center",

    gap: "8px",

    fontSize: "0.92rem",

    color: "#334155",

    cursor: "pointer",
  },


  checkbox: {
    width: "16px",

    height: "16px",

    accentColor: "#0f4a88",
  },


  button: {
    width: "100%",

    padding: "14px",

    background:
      "linear-gradient(135deg, #0f4a88 0%, #143d73 100%)",

    color: "#fff",

    border: "none",

    borderRadius: "16px",

    marginTop: "4px",

    cursor: "pointer",

    fontWeight: "800",

    fontSize: "1rem",

    boxShadow:
      "0 12px 24px rgba(15, 74, 136, 0.20)",
  },


  error: {
    color: "#dc2626",

    background: "#fef2f2",

    border:
      "1px solid #fecaca",

    fontSize: "14px",

    padding: "12px",

    borderRadius: "12px",

    textAlign: "center",

    fontWeight: "700",
  },


  ownerForgotBtn: {
    border: "none",

    padding: "10px 16px",

    borderRadius: "14px",

    background:
      "linear-gradient(135deg, #0f4a88 0%, #143d73 100%)",

    color: "#fff",

    fontWeight: "800",

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(15,74,136,0.18)",
  },


  modalOverlay: {
    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.45)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 9999,

    padding: "15px",
  },


  modalCard: {
    width: "100%",

    maxWidth: "420px",

    background: "#fff",

    padding: "28px",

    borderRadius: "24px",

    boxShadow:
      "0 25px 60px rgba(0,0,0,0.25)",

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

    border:
      "1px solid #dbe4ef",

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