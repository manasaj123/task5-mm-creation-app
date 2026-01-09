import React, { useState } from "react";

const formRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1
};

const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db"
};

const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer"
};

export default function MaterialForm({ onSave }) {
  const [form, setForm] = useState({
    name: "",
    uom: "",
    shelf_life_days: "",
    valuation_method: "MOVING_AVG",
    issue_type: "FIFO",
    perishable: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...form,
      shelf_life_days: form.shelf_life_days
        ? Number(form.shelf_life_days)
        : 0,
      perishable: !!form.perishable
    });
    setForm({
      name: "",
      uom: "",
      shelf_life_days: "",
      valuation_method: "MOVING_AVG",
      issue_type: "FIFO",
      perishable: false
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Name
          <input
            style={inputStyle}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label style={labelStyle}>
          UOM
          <input
            style={inputStyle}
            name="uom"
            value={form.uom}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Shelf life (days)
          <input
            style={inputStyle}
            type="number"
            name="shelf_life_days"
            value={form.shelf_life_days}
            onChange={handleChange}
          />
        </label>
        <label style={labelStyle}>
          Valuation Method
          <select
            style={inputStyle}
            name="valuation_method"
            value={form.valuation_method}
            onChange={handleChange}
          >
            <option value="MOVING_AVG">MOVING_AVG</option>
            <option value="FIFO">FIFO</option>
          </select>
        </label>
        <label style={labelStyle}>
          Issue Type
          <select
            style={inputStyle}
            name="issue_type"
            value={form.issue_type}
            onChange={handleChange}
          >
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "8px", fontSize: "13px" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            name="perishable"
            checked={form.perishable}
            onChange={handleChange}
          />
          <span>Perishable item (has expiry)</span>
        </label>
      </div>

      <button type="submit" style={buttonStyle}>
        Save Material
      </button>
    </form>
  );
}
