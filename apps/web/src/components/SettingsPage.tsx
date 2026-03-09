import { useState } from "react";
import { PageLayout } from "./PageLayout";
import { Save } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "SzPOS Store",
    businessPhone: "+91 9876543210",
    businessAddress: "123 Main Street, City, State",
    gstNumber: "18AAAA0000A1Z5",
    currencySymbol: "₹",
    taxRate: "18"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
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

          <button onClick={handleSave} className="btn-primary save-btn">
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
