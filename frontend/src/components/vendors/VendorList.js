import React from "react";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb"
};

const tdStyle = {
  padding: "6px 8px",
  borderBottom: "1px solid #f3f4f6"
};

const badgeStyle = (type) => ({
  display: "inline-block",
  padding: "2px 6px",
  borderRadius: "999px",
  fontSize: "11px",
  backgroundColor: type === "FARMER" ? "#f97316" : "#10b981",
  color: "#ffffff"
});

export default function VendorList({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ fontSize: "13px", color: "#6b7280" }}>No vendors found.</div>;
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Contact</th>
          <th style={thStyle}>GST</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Rating</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v) => (
          <tr key={v.id}>
            <td style={tdStyle}>{v.name}</td>
            <td style={tdStyle}>
              <span style={badgeStyle(v.type)}>{v.type}</span>
            </td>
            <td style={tdStyle}>{v.contact}</td>
            <td style={tdStyle}>{v.gst_no}</td>
            <td style={tdStyle}>{v.status}</td>
            <td style={tdStyle}>{v.rating}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
