import React, { useEffect, useState } from "react";
import materialApi from "../api/materialApi";
import MaterialForm from "../components/materials/MaterialForm";
import MaterialList from "../components/materials/MaterialList";

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

export default function MaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await materialApi.getAll();
      setMaterials(res.data);
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
      await materialApi.create(form);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Materials</div>

      <div style={cardStyle}>
        <MaterialForm onSave={handleSave} />
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : (
          <MaterialList data={materials} />
        )}
      </div>
    </div>
  );
}
