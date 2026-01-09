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

export default function MaterialList({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "#6b7280" }}>
        No materials yet.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>ID</th>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>UOM</th>
          <th style={thStyle}>Shelf life (days)</th>
          <th style={thStyle}>Valuation</th>
          <th style={thStyle}>Issue Type</th>
          <th style={thStyle}>Type</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m) => {
          const isPerishable = m.perishable === 1 || m.perishable === true;
          return (
            <tr key={m.id}>
              <td style={tdStyle}>{m.id}</td>
              <td style={tdStyle}>{m.name}</td>
              <td style={tdStyle}>{m.uom}</td>
              <td style={tdStyle}>{m.shelf_life_days}</td>
              <td style={tdStyle}>{m.valuation_method}</td>
              <td style={tdStyle}>{m.issue_type}</td>
              <td style={tdStyle}>
                {isPerishable ? "Perishable" : "Non‑perishable"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
