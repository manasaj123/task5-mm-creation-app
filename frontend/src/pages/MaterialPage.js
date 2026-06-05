import React, { useEffect, useState } from "react";
import materialApi from "../api/materialApi";
import MaterialForm from "../components/materials/MaterialForm";
import MaterialList from "../components/materials/MaterialList";

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  marginBottom: "24px",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  borderRadius: "16px",
  padding: "18px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  marginBottom: "18px",
  border: "1px solid rgba(255,255,255,0.2)"
};

const pageContainer = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px"
};

export default function MaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

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
      if (editingMaterial) {
        await materialApi.update(editingMaterial.id, form);
      } else {
        await materialApi.create(form);
      }
      setEditingMaterial(null);
      await loadData();
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save material");
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
  };

  // src/pages/MaterialPage.js

const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this material?")) {
    try {
      // ✅ must be remove, not deleteMaterial
      await materialApi.remove(id);
      await loadData();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete material");
    }
  }
};


  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };

  return (
    <div style={pageContainer}>
      <div style={titleStyle}>Materials Management</div>

      <div style={cardStyle}>
        <MaterialForm
          onSave={handleSave}
          editingMaterial={editingMaterial}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
              background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              borderRadius: "12px"
            }}
          >
            Loading materials...
          </div>
        ) : (
          <MaterialList
            data={materials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
