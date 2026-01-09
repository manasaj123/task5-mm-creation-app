import React, { useEffect, useState } from "react";
import stockApi from "../api/stockApi";

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

export default function StockPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await stockApi.getSummary();
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const perishableRows = rows.filter((r) => r.perishable === 1);
  const nonPerishableRows = rows.filter((r) => r.perishable === 0);

  return (
    <div>
      <div style={titleStyle}>Stock Summary</div>

      <div style={cardStyle}>
        <button
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            cursor: "pointer",
            marginBottom: "8px"
          }}
          onClick={load}
        >
          Refresh
        </button>

        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            No stock entries yet.
          </div>
        ) : (
          <>
            {/* Perishable node */}
            <div
              style={{ fontSize: "14px", fontWeight: 600, margin: "8px 0" }}
            >
              Perishable Stock
            </div>
            {perishableRows.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                No perishable stock.
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Material ID</th>
                    <th style={thStyle}>Location ID</th>
                    <th style={thStyle}>Batch ID</th>
                    <th style={thStyle}>Expiry Date</th>
                    <th style={thStyle}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {perishableRows.map((r) => (
                    <tr
                      key={
                        r.material_id +
                        "-" +
                        r.location_id +
                        "-" +
                        (r.batch_id || "NB")
                      }
                      style={{ backgroundColor: "#fef2f2" }}
                    >
                      <td style={tdStyle}>{r.material_id}</td>
                      <td style={tdStyle}>{r.location_id}</td>
                      <td style={tdStyle}>{r.batch_id || "-"}</td>
                      <td style={tdStyle}>
                        {r.expiry_date ? r.expiry_date.substring(0, 10) : "-"}
                      </td>
                      <td style={tdStyle}>{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Non‑perishable node */}
            <div
              style={{ fontSize: "14px", fontWeight: 600, margin: "12px 0" }}
            >
              Non‑perishable Stock
            </div>
            {nonPerishableRows.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                No non‑perishable stock.
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Material ID</th>
                    <th style={thStyle}>Location ID</th>
                    <th style={thStyle}>Batch ID</th>
                    <th style={thStyle}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {nonPerishableRows.map((r) => (
                    <tr
                      key={
                        r.material_id +
                        "-" +
                        r.location_id +
                        "-" +
                        (r.batch_id || "NB")
                      }
                    >
                      <td style={tdStyle}>{r.material_id}</td>
                      <td style={tdStyle}>{r.location_id}</td>
                      <td style={tdStyle}>{r.batch_id || "-"}</td>
                      <td style={tdStyle}>{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
