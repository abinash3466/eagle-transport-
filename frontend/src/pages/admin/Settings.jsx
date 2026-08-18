import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  Check,
  Gauge,
  LayoutDashboard,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  companyName: "Eagle Transport Ltd.",
  supportEmail: "support@eagletransport.in",
  supportPhone: "+91 9876543210",

  whatsappUpdates: true,
  emailReports: true,
  smsAlerts: true,

  compactMode: false,
  reduceMotion: false,
  showQuickStats: true,
};

const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const applyPreferences = (nextSettings) => {
    if (typeof document === "undefined") return;

    document.body.setAttribute(
      "data-dashboard-density",
      nextSettings.compactMode ? "compact" : "comfortable"
    );

    document.body.setAttribute(
      "data-reduced-motion",
      nextSettings.reduceMotion ? "true" : "false"
    );

    document.body.setAttribute(
      "data-show-quickstats",
      nextSettings.showQuickStats ? "true" : "false"
    );
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("eagle_settings");
    let mergedSettings = { ...DEFAULT_SETTINGS };

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      } catch (error) {
        console.error("Unable to read saved settings:", error);
      }
    }

    setSettings(mergedSettings);
    applyPreferences(mergedSettings);
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (
        field === "compactMode" ||
        field === "reduceMotion" ||
        field === "showQuickStats"
      ) {
        applyPreferences(next);
      }

      return next;
    });

    setSaved(false);
  };


  const handleSave = () => {
    localStorage.setItem("eagle_settings", JSON.stringify(settings));
    localStorage.setItem("companyName", settings.companyName);
    localStorage.setItem("supportEmail", settings.supportEmail);
    localStorage.setItem("supportPhone", settings.supportPhone);

    applyPreferences(settings);

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      <style>{`
        /* =====================================================
           SETTINGS - PREMIUM OWNER DASHBOARD
           Desktop + Laptop + Mobile
        ===================================================== */

        .eagle-settings-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
        }

        .eagle-settings-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 26px 28px;
          border-radius: 26px;
          background: linear-gradient(135deg, #071b34 0%, #0d3767 55%, #135ca1 100%);
          box-shadow: 0 18px 45px rgba(8, 46, 86, 0.18);
          color: #fff;
        }

        .eagle-settings-hero::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -85px;
          top: -100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          pointer-events: none;
        }

        .eagle-settings-hero-copy {
          position: relative;
          z-index: 1;
          min-width: 0;
        }

        .eagle-settings-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .35px;
        }

        .eagle-settings-hero h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 900;
          color: rgb(255, 255, 255);
          letter-spacing: -0.7px;
        }

        .eagle-settings-hero p {
          max-width: 680px;
          margin: 8px 0 0;
          color: rgba(255,255,255,.80);
          font-size: 13px;
          line-height: 1.55;
        }

        .eagle-settings-save-top {
          position: relative;
          z-index: 1;
          min-width: 152px;
          min-height: 44px;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 13px;
          background: rgba(255,255,255,.12);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(0,0,0,.12);
          transition: transform .18s ease, background .18s ease;
        }

        .eagle-settings-save-top:hover {
          background: rgba(255,255,255,.18);
        }

        .eagle-settings-save-top:active {
          transform: scale(.97);
        }

        .eagle-settings-grid {
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 18px;
          align-items: start;
        }

        .eagle-settings-column {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .eagle-settings-card {
          width: 100%;
          padding: 22px;
          border-radius: 22px;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-light, #e5eaf1);
          box-shadow: 0 10px 28px rgba(12, 47, 82, .07);
          box-sizing: border-box;
        }

        .eagle-settings-card-head {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
        }

        .eagle-settings-card-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #0f4f8a;
          background: #edf6ff;
          border: 1px solid #dcecff;
        }

        .eagle-settings-card-head h2 {
          margin: 0;
          color: var(--dark-blue, #0c3158);
          font-size: 16px;
          line-height: 1.2;
          font-weight: 900;
        }

        .eagle-settings-card-head p {
          margin: 3px 0 0;
          color: var(--text-muted, #64748b);
          font-size: 10.5px;
          line-height: 1.4;
        }

        .eagle-settings-form-group {
          margin-bottom: 13px;
        }

        .eagle-settings-form-group:last-of-type {
          margin-bottom: 0;
        }

        .eagle-settings-label {
          display: block;
          margin-bottom: 6px;
          color: var(--dark-blue, #0c3158);
          font-size: 11px;
          font-weight: 800;
        }

        .eagle-settings-input {
          width: 100%;
          min-height: 44px;
          padding: 0 13px;
          border-radius: 12px;
          border: 1px solid var(--border-light, #dce4ee);
          outline: none;
          background: var(--bg-secondary, #f8fbff);
          color: var(--text-primary, #16324f);
          box-sizing: border-box;
          font-size: 12px;
          font-weight: 650;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .eagle-settings-input:focus {
          border-color: #8dbce8;
          box-shadow: 0 0 0 3px rgba(15, 79, 138, .08);
        }

        .eagle-settings-preview {
          margin-top: 16px;
          padding: 14px;
          border-radius: 15px;
          background: linear-gradient(135deg, rgba(15,74,136,.06), rgba(37,99,235,.025));
          border: 1px solid var(--border-light, #dce4ee);
        }

        .eagle-settings-preview-title {
          margin: 0 0 9px;
          color: var(--dark-blue, #0c3158);
          font-size: 11px;
          font-weight: 900;
        }

        .eagle-settings-preview p {
          margin: 5px 0;
          color: var(--text-muted, #64748b);
          font-size: 10.5px;
          overflow-wrap: anywhere;
        }

        .eagle-settings-preview strong {
          color: var(--text-primary, #16324f);
        }


        .eagle-setting-list {
          display: grid;
          gap: 9px;
        }

        .eagle-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 52px;
          padding: 10px 12px;
          border-radius: 14px;
          background: var(--bg-secondary, #f8fbff);
          border: 1px solid var(--border-light, #dce4ee);
          color: var(--text-primary, #16324f);
        }

        .eagle-setting-row-copy {
          min-width: 0;
        }

        .eagle-setting-row strong {
          display: block;
          font-size: 11px;
          line-height: 1.25;
        }

        .eagle-setting-row small {
          display: block;
          margin-top: 3px;
          color: var(--text-muted, #64748b);
          font-size: 9px;
          line-height: 1.35;
        }

        .eagle-switch {
          width: 42px;
          height: 24px;
          flex: 0 0 42px;
          padding: 2px;
          border: none;
          border-radius: 999px;
          background: #cbd5e1;
          cursor: pointer;
          transition: background .2s ease;
        }

        .eagle-switch.on {
          background: linear-gradient(135deg, #0f5b9f, #2876bb);
        }

        .eagle-switch-knob {
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 6px rgba(15,23,42,.18);
          transform: translateX(0);
          transition: transform .2s ease;
        }

        .eagle-switch.on .eagle-switch-knob {
          transform: translateX(18px);
        }

        .eagle-settings-security {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: 15px;
          background: linear-gradient(135deg, rgba(16,185,129,.09), rgba(37,99,235,.06));
          border: 1px solid rgba(16,185,129,.13);
          color: var(--text-primary, #16324f);
        }

        .eagle-settings-security svg {
          color: #0f8a64;
          flex-shrink: 0;
        }

        .eagle-settings-security h4 {
          margin: 0;
          font-size: 11px;
          font-weight: 900;
        }

        .eagle-settings-security p {
          margin: 4px 0 0;
          color: var(--text-muted, #64748b);
          font-size: 9.5px;
          line-height: 1.45;
        }

        .eagle-settings-bottom-save {
          width: 100%;
          min-height: 46px;
          margin-top: 14px;
          border: none;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #0f5798, #123f70);
          color: #fff;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 9px 20px rgba(15,74,136,.17);
          transition: transform .18s ease;
        }

        .eagle-settings-bottom-save:active {
          transform: scale(.98);
        }

        /* ============================
           LARGE MOBILE / TABLET
        ============================ */
        @media (max-width: 768px) {
          .eagle-settings-page {
            gap: 12px;
          }

          .eagle-settings-hero {
            align-items: flex-start;
            padding: 17px;
            border-radius: 20px;
            gap: 12px;
          }

          .eagle-settings-kicker {
            margin-bottom: 8px;
            padding: 6px 9px;
            font-size: 9px;
          }

          .eagle-settings-hero h1 {
            font-size: 22px;
          }

          .eagle-settings-hero p {
            margin-top: 6px;
            max-width: 290px;
            font-size: 10px;
            line-height: 1.45;
          }

          .eagle-settings-save-top {
            min-width: 42px;
            width: 42px;
            height: 42px;
            min-height: 42px;
            padding: 0;
            border-radius: 12px;
          }

          .eagle-settings-save-top span {
            display: none;
          }

          .eagle-settings-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .eagle-settings-column {
            gap: 12px;
          }

          .eagle-settings-card {
            padding: 15px;
            border-radius: 18px;
            box-shadow: 0 8px 20px rgba(12,47,82,.055);
          }

          .eagle-settings-card-head {
            gap: 9px;
            margin-bottom: 13px;
          }

          .eagle-settings-card-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
          }

          .eagle-settings-card-icon svg {
            width: 16px;
            height: 16px;
          }

          .eagle-settings-card-head h2 {
            font-size: 14px;
          }

          .eagle-settings-card-head p {
            font-size: 9px;
          }

          .eagle-settings-form-group {
            margin-bottom: 10px;
          }

          .eagle-settings-label {
            margin-bottom: 5px;
            font-size: 9.5px;
          }

          .eagle-settings-input {
            min-height: 41px;
            padding: 0 11px;
            border-radius: 11px;
            font-size: 11px;
          }

          .eagle-settings-preview {
            margin-top: 12px;
            padding: 11px;
            border-radius: 12px;
          }

          .eagle-settings-preview-title {
            font-size: 10px;
          }

          .eagle-settings-preview p {
            font-size: 9px;
          }


          .eagle-setting-list {
            gap: 7px;
          }

          .eagle-setting-row {
            min-height: 47px;
            padding: 8px 10px;
            border-radius: 12px;
          }

          .eagle-setting-row strong {
            font-size: 10px;
          }

          .eagle-setting-row small {
            font-size: 8.5px;
          }

          .eagle-switch {
            width: 39px;
            height: 22px;
            flex-basis: 39px;
          }

          .eagle-switch-knob {
            width: 18px;
            height: 18px;
          }

          .eagle-switch.on .eagle-switch-knob {
            transform: translateX(17px);
          }

          .eagle-settings-security {
            padding: 11px;
            border-radius: 12px;
          }

          .eagle-settings-security h4 {
            font-size: 10px;
          }

          .eagle-settings-security p {
            font-size: 8.5px;
          }

          .eagle-settings-bottom-save {
            min-height: 42px;
            margin-top: 11px;
            border-radius: 11px;
            font-size: 10.5px;
          }
        }

        /* ============================
           SMALL MOBILE
        ============================ */
        @media (max-width: 420px) {
          .eagle-settings-hero {
            padding: 14px;
            border-radius: 18px;
          }

          .eagle-settings-hero h1 {
            font-size: 20px;
          }

          .eagle-settings-hero p {
            max-width: 250px;
            font-size: 9px;
          }

          .eagle-settings-save-top {
            width: 38px;
            min-width: 38px;
            height: 38px;
            min-height: 38px;
          }

          .eagle-settings-card {
            padding: 13px;
            border-radius: 16px;
          }

          .eagle-settings-card-head {
            margin-bottom: 11px;
          }

          .eagle-settings-card-head h2 {
            font-size: 13px;
          }

          .eagle-settings-input {
            min-height: 39px;
            font-size: 10.5px;
          }


          .eagle-setting-row {
            min-height: 44px;
          }

          .eagle-setting-row small {
            max-width: 220px;
          }
        }
      `}</style>

      <div className="eagle-settings-page">
        <motion.section
          className="eagle-settings-hero"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="eagle-settings-hero-copy">
            <div className="eagle-settings-kicker">
              <Sparkles size={13} />
              OWNER CONTROL CENTER
            </div>

            <h1>Dashboard Settings</h1>
            <p>
              Personalize Eagle Transport Owner Dashboard appearance,
              notifications and day-to-day dashboard experience.
            </p>
          </div>

          <button className="eagle-settings-save-top" onClick={handleSave}>
            {saved ? <Check size={17} /> : <Save size={17} />}
            <span>{saved ? "Saved" : "Save Settings"}</span>
          </button>
        </motion.section>

        <div className="eagle-settings-grid">
          <div className="eagle-settings-column">
            <motion.section
              className="eagle-settings-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.03 }}
            >
              <div className="eagle-settings-card-head">
                <div className="eagle-settings-card-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2>Company Profile</h2>
                  <p>Contact details used across your dashboard.</p>
                </div>
              </div>

              <div className="eagle-settings-form-group">
                <label className="eagle-settings-label">Company Name</label>
                <input
                  className="eagle-settings-input"
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                />
              </div>

              <div className="eagle-settings-form-group">
                <label className="eagle-settings-label">Support Email</label>
                <input
                  className="eagle-settings-input"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                />
              </div>

              <div className="eagle-settings-form-group">
                <label className="eagle-settings-label">Support Phone</label>
                <input
                  className="eagle-settings-input"
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                />
              </div>

              <div className="eagle-settings-preview">
                <h4 className="eagle-settings-preview-title">Live Company Preview</h4>
                <p><strong>Company:</strong> {settings.companyName}</p>
                <p><strong>Email:</strong> {settings.supportEmail}</p>
                <p><strong>Phone:</strong> {settings.supportPhone}</p>
              </div>
            </motion.section>

            <motion.section
              className="eagle-settings-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
            >
              <div className="eagle-settings-card-head">
                <div className="eagle-settings-card-icon">
                  <Bell size={18} />
                </div>
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose which operational updates matter to you.</p>
                </div>
              </div>

              <div className="eagle-setting-list">
                <SettingToggle
                  title="WhatsApp Booking Updates"
                  description="Receive important booking notifications."
                  enabled={settings.whatsappUpdates}
                  onChange={() => handleChange("whatsappUpdates", !settings.whatsappUpdates)}
                />

                <SettingToggle
                  title="Email Daily Reports"
                  description="Keep daily operational summaries enabled."
                  enabled={settings.emailReports}
                  onChange={() => handleChange("emailReports", !settings.emailReports)}
                />

                <SettingToggle
                  title="Emergency SMS Alerts"
                  description="Keep urgent fleet alerts easy to notice."
                  enabled={settings.smsAlerts}
                  onChange={() => handleChange("smsAlerts", !settings.smsAlerts)}
                />
              </div>
            </motion.section>
          </div>

          <div className="eagle-settings-column">

            <motion.section
              className="eagle-settings-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <div className="eagle-settings-card-head">
                <div className="eagle-settings-card-icon">
                  <LayoutDashboard size={18} />
                </div>
                <div>
                  <h2>Dashboard Experience</h2>
                  <p>Useful preferences for faster daily owner operations.</p>
                </div>
              </div>

              <div className="eagle-setting-list">
                <SettingToggle
                  title="Compact Dashboard"
                  description="Reduce dashboard spacing and fit more information on screen."
                  enabled={settings.compactMode}
                  onChange={() => handleChange("compactMode", !settings.compactMode)}
                  icon={<Gauge size={15} />}
                />

                <SettingToggle
                  title="Show Quick Stats"
                  description="Show the dashboard quick-stat section when available."
                  enabled={settings.showQuickStats}
                  onChange={() => handleChange("showQuickStats", !settings.showQuickStats)}
                  icon={<LayoutDashboard size={15} />}
                />

                <SettingToggle
                  title="Reduce Animations"
                  description="Useful on slower phones for a faster, lighter dashboard feel."
                  enabled={settings.reduceMotion}
                  onChange={() => handleChange("reduceMotion", !settings.reduceMotion)}
                  icon={<Zap size={15} />}
                />
              </div>
            </motion.section>

            <motion.section
              className="eagle-settings-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.13 }}
            >
              <div className="eagle-settings-card-head">
                <div className="eagle-settings-card-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2>Dashboard Protection</h2>
                  <p>Your owner preferences stay on this browser.</p>
                </div>
              </div>

              <div className="eagle-settings-security">
                <ShieldCheck size={19} />
                <div>
                  <h4>Local Preference Storage</h4>
                  <p>
                    Appearance, notification and dashboard preferences are restored
                    automatically after refresh on this device.
                  </p>
                </div>
              </div>

              <button className="eagle-settings-bottom-save" onClick={handleSave}>
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Settings Saved" : "Save All Settings"}
              </button>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

const SettingToggle = ({
  title,
  description,
  enabled,
  onChange,
  icon,
}) => (
  <div className="eagle-setting-row">
    <div className="eagle-setting-row-copy">
      <strong>
        {icon ? (
          <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}>
            {icon}
          </span>
        ) : null}
        {title}
      </strong>
      <small>{description}</small>
    </div>

    <button
      type="button"
      className={`eagle-switch ${enabled ? "on" : ""}`}
      onClick={onChange}
      aria-pressed={enabled}
      aria-label={title}
    >
      <span className="eagle-switch-knob" />
    </button>
  </div>
);

export default Settings;