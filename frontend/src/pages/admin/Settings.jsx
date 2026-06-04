import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  Moon,
  Sun,
  Save,
  Building2,
  Mail,
  Phone,
  Bell,
  ShieldCheck,
} from "lucide-react";

const Settings = ({ theme, setTheme }) => {
  const [settings, setSettings] = useState({
    companyName: "Eagle Transport Ltd.",
    supportEmail: "support@eagletransport.in",
    supportPhone: "+91 9876543210",

    whatsappUpdates: true,
    emailReports: true,
    smsAlerts: true,
    darkMode: false,
  });

  // LOAD SETTINGS
  useEffect(() => {
    const savedSettings = localStorage.getItem("eagle_settings");

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);

      setSettings(parsed);

      if (parsed.darkMode) {
        document.body.setAttribute("data-theme", "dark");

        if (setTheme) {
          setTheme("dark");
        }
      }
    }
  }, []);

  // HANDLE INPUT
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // DARK MODE TOGGLE
  const handleDarkMode = () => {
    const newDarkMode = !settings.darkMode;

    handleChange("darkMode", newDarkMode);

    const newTheme = newDarkMode ? "dark" : "light";

    document.body.setAttribute("data-theme", newTheme);

    localStorage.setItem("theme", newTheme);

    if (setTheme) {
      setTheme(newTheme);
    }
  };

  // SAVE SETTINGS
  const handleSave = () => {
    localStorage.setItem(
      "eagle_settings",
      JSON.stringify(settings)
    );

    // GLOBAL VALUES
    localStorage.setItem(
      "companyName",
      settings.companyName
    );

    localStorage.setItem(
      "supportEmail",
      settings.supportEmail
    );

    localStorage.setItem(
      "supportPhone",
      settings.supportPhone
    );

    alert("Settings Saved Successfully ✅");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
      }}
    >
      {/* LEFT CARD */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={styles.card}
      >
        <div style={styles.header}>
          <Building2 size={24} />
          <h2 style={styles.title}>Company Profile</h2>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Company Name</label>

          <input
            type="text"
            value={settings.companyName}
            onChange={(e) =>
              handleChange("companyName", e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Support Email</label>

          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) =>
              handleChange("supportEmail", e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Support Phone</label>

          <input
            type="text"
            value={settings.supportPhone}
            onChange={(e) =>
              handleChange("supportPhone", e.target.value)
            }
            style={styles.input}
          />
        </div>

        {/* LIVE PREVIEW */}

        <div style={styles.previewCard}>
          <h4 style={styles.previewTitle}>
            Live Company Preview
          </h4>

          <p>
            <strong>Company:</strong>{" "}
            {settings.companyName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {settings.supportEmail}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {settings.supportPhone}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={styles.saveBtn}
        >
          <Save size={18} />
          Save Changes
        </button>
      </motion.div>

      {/* RIGHT CARD */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
        style={styles.card}
      >
        <div style={styles.header}>
          <Bell size={24} />
          <h2 style={styles.title}>
            Notification Preferences
          </h2>
        </div>

        <div style={styles.settingList}>
          {/* WhatsApp */}

          <label style={styles.settingItem}>
            <span>WhatsApp Booking Updates</span>

            <input
              type="checkbox"
              checked={settings.whatsappUpdates}
              onChange={() =>
                handleChange(
                  "whatsappUpdates",
                  !settings.whatsappUpdates
                )
              }
            />
          </label>

          {/* Email */}

          <label style={styles.settingItem}>
            <span>Email Daily Reports</span>

            <input
              type="checkbox"
              checked={settings.emailReports}
              onChange={() =>
                handleChange(
                  "emailReports",
                  !settings.emailReports
                )
              }
            />
          </label>

          {/* SMS */}

          <label style={styles.settingItem}>
            <span>Emergency SMS Alerts</span>

            <input
              type="checkbox"
              checked={settings.smsAlerts}
              onChange={() =>
                handleChange(
                  "smsAlerts",
                  !settings.smsAlerts
                )
              }
            />
          </label>
</div>
        {/* SECURITY */}

        <div style={styles.securityCard}>
          <ShieldCheck size={22} />

          <div>
            <h4 style={{ margin: 0 }}>
              Premium Secure Dashboard
            </h4>

            <p style={styles.securityText}>
              Your settings are securely stored in local
              storage and auto restored after refresh.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  card: {
    padding: "32px",
    borderRadius: "24px",
    background: "var(--card-bg)",
    border: "1px solid var(--border-light)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    color: "var(--dark-blue)",
  },

  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "800",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "var(--dark-blue)",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  saveBtn: {
    marginTop: "10px",
    borderRadius: "14px",
    padding: "14px 22px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  settingList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  settingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderRadius: "16px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-light)",
    cursor: "pointer",
    color: "var(--text-primary)",
    fontWeight: "600",
  },

  previewCard: {
    marginTop: "28px",
    padding: "18px",
    borderRadius: "18px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
  },

  previewTitle: {
    marginTop: 0,
    marginBottom: "12px",
  },

  securityCard: {
    marginTop: "28px",
    padding: "18px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,23,42,0.08))",
    border: "1px solid var(--border-light)",
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    color: "var(--text-primary)",
  },

  securityText: {
    marginTop: "6px",
    marginBottom: 0,
    color: "var(--text-muted)",
    lineHeight: "1.6",
  },
};

export default Settings;