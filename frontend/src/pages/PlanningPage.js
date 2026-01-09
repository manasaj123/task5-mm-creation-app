import React, { useEffect, useState } from "react";
import stockApi from "../api/stockApi";
import materialApi from "../api/materialApi";

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

const textStyle = {
  fontSize: "13px",
  color: "#4b5563"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  marginTop: "8px"
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

export default function PlanningPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPlanning = async () => {
    try {
      setLoading(true);

      // 1) fetch stock summary and materials master
      const [stockRes, matRes] = await Promise.all([
        stockApi.getSummary(), // GET /api/stock/summary
        materialApi.getAll()   // GET /api/materials
      ]);

      const stock = stockRes.data || [];
      const materials = matRes.data || [];

      // group stock by material
      const byMaterial = stock.reduce((acc, row) => {
        const key = row.material_id;
        acc[key] = (acc[key] || 0) + Number(row.qty || 0);
        return acc;
      }, {});

      // build planning rows
      const planningRows = materials.map((m) => {
        const currentQty = byMaterial[m.id] || 0;

        // for demo: simple fixed min/max; could be columns in materials table
        const minQty = 10;
        const maxQty = 30;

        const suggestedQty = Math.max(0, maxQty - currentQty);

        return {
          material_id: m.id,
          material_name: m.name,
          uom: m.uom,
          currentQty,
          minQty,
          maxQty,
          suggestedQty
        };
      });

      // show only items below min
      const filtered = planningRows.filter((r) => r.currentQty < r.minQty);

      setRows(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanning();
  }, []);

  return (
    <div>
      <div style={titleStyle}>Planning Board</div>

      <div style={cardStyle}>
        <p style={textStyle}>
          This view suggests PR quantities when current stock goes below a simple minimum level for each material.
        </p>

        <button
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            cursor: "pointer",
            marginTop: "8px",
            marginBottom: "8px"
          }}
          onClick={loadPlanning}
        >
          Refresh suggestions
        </button>

        {loading ? (
          <div style={textStyle}>Calculating suggestions...</div>
        ) : rows.length === 0 ? (
          <div style={textStyle}>All materials are above minimum stock.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>UOM</th>
                <th style={thStyle}>Current</th>
                <th style={thStyle}>Min</th>
                <th style={thStyle}>Max</th>
                <th style={thStyle}>Suggested PR Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.material_id}>
                  <td style={tdStyle}>{r.material_name}</td>
                  <td style={tdStyle}>{r.uom}</td>
                  <td style={tdStyle}>{r.currentQty}</td>
                  <td style={tdStyle}>{r.minQty}</td>
                  <td style={tdStyle}>{r.maxQty}</td>
                  <td style={tdStyle}>{r.suggestedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
