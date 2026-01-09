import React, { useEffect, useState } from "react";
import vendorApi from "../api/vendorApi";
import VendorForm from "../components/vendors/VendorForm";
import VendorList from "../components/vendors/VendorList";

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  marginBottom: "16px"
};

export default function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getAll();
      setVendors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (form) => {
    try {
      await vendorApi.create(form);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Vendors / Farmers</div>

      <div style={cardStyle}>
        <VendorForm onSave={handleSave} />
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : (
          <VendorList data={vendors} />
        )}
      </div>
    </div>
  );
}
