import { useEffect, useState } from "react";
import { PageLayout } from "./PageLayout";
import { Save, AlertCircle } from "lucide-react";
import { apiClient } from "../api/client";

const SETTINGS_KEY = "szpos.settings";

const defaultSettings = {
  businessName: "SzPOS Store",
  businessPhone: "+91 9876543210",
  businessAddress: "123 Main Street, City, State",
  gstNumber: "18AAAA0000A1Z5",
  currencySymbol: "₹",
  taxRate: "18"
};

export function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings.");
    }
  };

  const handleResetPOS = async () => {
    const password = prompt("Enter reset password to confirm POS reset:");
    if (!password) return;

    if (!confirm("⚠️ This will clear all sales, returns, and reset inventory.\nContinue?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.resetPOS(password);
      alert("✅ POS reset successfully!\n\n" + JSON.stringify(response.resetData, null, 2));
      window.location.reload();
    } catch (error: any) {
      alert("❌ Reset failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Settings">
      <div className="settings-container">
        <h2>Business Settings</h2>

        <div className="settings-form">
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={settings.businessName}
              onChange={handleChange}
              placeholder="Enter business name"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="businessPhone"
              value={settings.businessPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="businessAddress"
              value={settings.businessAddress}
              onChange={handleChange}
              placeholder="Enter business address"
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={settings.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Currency Symbol</label>
              <input
                type="text"
                name="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleChange}
                placeholder="₹"
              />
            </div>

            <div className="form-group">
              <label>Default GST Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                placeholder="18"
              />
            </div>
          </div>


          <div className="form-row">
            <div className="form-group">
              <label>Print Method</label>
              <select
                name="printMethod"
                value={settings.printMethod}
                onChange={handleChange}
              >
                <option value="thermal">Thermal Printer API (Recommended)</option>
                <option value="browser">Browser Print</option>
              </select>
            </div>

            <div className="form-group">
              <label>Chrome Kiosk Printing</label>
              <select
                name="kioskPrinting"
                value={settings.kioskPrinting}
                onChange={handleChange}
              >
                <option value="true">Enabled (silent print)</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
            For silent print, launch Chrome with <code>--kiosk-printing</code>.
          </p>

          <button onClick={handleSave} className="btn-primary save-btn">
            <Save size={20} />
            Save Settings
          </button>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
            <AlertCircle size={20} style={{ color: "#ef4444" }} />
            <h3 style={{ margin: 0, color: "#ef4444" }}>Danger Zone</h3>
          </div>
          
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "15px" }}>
            Reset all POS data including sales, returns, and inventory. This action cannot be undone.
          </p>

          <button 
            onClick={handleResetPOS}
            disabled={loading}
            className="btn-danger"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={18} />
            {loading ? "Resetting..." : "Reset POS"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
