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

export default function VendorForm({ onSave }) {
  const [form, setForm] = useState({
    name: "",
    type: "VENDOR",
    address: "",
    contact: "",
    gst_no: "",
    bank_details: "",
    status: "ACTIVE",
    rating: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSave(form);
    setForm({
      name: "",
      type: "VENDOR",
      address: "",
      contact: "",
      gst_no: "",
      bank_details: "",
      status: "ACTIVE",
      rating: 0
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
          Type
          <select
            style={inputStyle}
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="VENDOR">Vendor</option>
            <option value="FARMER">Farmer</option>
          </select>
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Address
          <input
            style={inputStyle}
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </label>
        <label style={labelStyle}>
          Contact
          <input
            style={inputStyle}
            name="contact"
            value={form.contact}
            onChange={handleChange}
          />
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          GST No
          <input
            style={inputStyle}
            name="gst_no"
            value={form.gst_no}
            onChange={handleChange}
          />
        </label>
        <label style={labelStyle}>
          Bank Details
          <input
            style={inputStyle}
            name="bank_details"
            value={form.bank_details}
            onChange={handleChange}
          />
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Status
          <select
            style={inputStyle}
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label style={labelStyle}>
          Rating
          <input
            style={inputStyle}
            name="rating"
            type="number"
            min="0"
            max="5"
            value={form.rating}
            onChange={handleChange}
          />
        </label>
      </div>

      <button type="submit" style={buttonStyle}>
        Save Vendor / Farmer
      </button>
    </form>
  );
}
