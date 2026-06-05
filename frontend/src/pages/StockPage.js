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

const sectionHeaderStyle = {
  fontSize: "14px",
  fontWeight: 600,
  margin: "8px 0",
  padding: "8px",
  backgroundColor: "#f3f4f6",
  borderRadius: "4px"
};

const totalRowStyle = {
  backgroundColor: "#e5e7eb",
  fontWeight: "bold"
};

const lowStockStyle = {
  color: "#dc2626",
  fontWeight: "bold"
};

const normalStockStyle = {
  color: "#10b981"
};

const expiredStockStyle = {
  backgroundColor: "#fee2e2",
  color: "#dc2626"
};

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return "-";
  if (dateString.length === 10) return dateString;
  return dateString.substring(0, 10);
};

// Check if stock is expired
const isExpired = (expiryDate) => {
  if (!expiryDate || expiryDate === "-") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
};

// Check if stock is expiring soon (within 7 days)
const isExpiringSoon = (expiryDate) => {
  if (!expiryDate || expiryDate === "-") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return daysDiff >= 0 && daysDiff <= 7;
};

export default function StockPage() {
  const [rows, setRows] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const [stockRes, materialRes] = await Promise.all([
        stockApi.getSummary(),
        materialApi.getAll()
      ]);
      setRows(stockRes.data);
      setMaterials(materialRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Get material name by ID
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === parseInt(materialId) || m.id === materialId);
    return material ? material.name : "-";
  };

  // Get material details by ID
  const getMaterialDetails = (materialId) => {
    return materials.find(m => m.id === parseInt(materialId) || m.id === materialId);
  };

  const perishableRows = rows.filter((r) => r.perishable === 1);
  const nonPerishableRows = rows.filter((r) => r.perishable === 0);

  // Calculate total quantities
  const totalPerishableQty = perishableRows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);
  const totalNonPerishableQty = nonPerishableRows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);
  const totalOverallQty = totalPerishableQty + totalNonPerishableQty;

  // Group by material for summary
  const getMaterialSummary = (rows, isPerishable) => {
    const summary = {};
    rows.forEach(row => {
      const materialId = row.material_id;
      const materialName = getMaterialName(materialId);
      if (!summary[materialId]) {
        summary[materialId] = {
          material_id: materialId,
          material_name: materialName,
          total_qty: 0,
          batches: [],
          isExpired: false,
          lowStockBatches: 0
        };
      }
      summary[materialId].total_qty += parseFloat(row.qty) || 0;
      summary[materialId].batches.push(row);
      if (row.expiry_date && isExpired(row.expiry_date)) {
        summary[materialId].isExpired = true;
      }
      if ((parseFloat(row.qty) || 0) < lowStockThreshold) {
        summary[materialId].lowStockBatches++;
      }
    });
    return Object.values(summary);
  };

  const perishableSummary = getMaterialSummary(perishableRows, true);
  const nonPerishableSummary = getMaterialSummary(nonPerishableRows, false);

  // Sort materials by name
  const sortByMaterialName = (a, b) => {
    const nameA = (a.material_name || "").toLowerCase();
    const nameB = (b.material_name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  };

  return (
    <div>
      <div style={titleStyle}>Stock Summary</div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "6px 10px",
              fontSize: "13px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              cursor: "pointer"
            }}
            onClick={load}
          >
            🔄 Refresh
          </button>
          
          <div style={{ fontSize: "12px", color: "#6b7280", marginLeft: "auto" }}>
            Total Items: {rows.length} | Total Quantity: {totalOverallQty.toFixed(2)}
          </div>
        </div>

        {loading ? (
          <div style={{ fontSize: "13px", textAlign: "center", padding: "20px" }}>
            Loading stock data...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", padding: "20px" }}>
            No stock entries yet.
          </div>
        ) : (
          <>
            {/* Perishable Stock Section */}
            <div style={sectionHeaderStyle}>
              🌡️ Perishable Stock 
              <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: "normal" }}>
                (Total: {totalPerishableQty.toFixed(2)} units)
              </span>
            </div>
            {perishableRows.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#6b7280", padding: "8px" }}>
                No perishable stock.
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Material ID</th>
                    <th style={thStyle}>Material Name</th>
                    <th style={thStyle}>Location ID</th>
                    <th style={thStyle}>Batch ID</th>
                    <th style={thStyle}>Expiry Date</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {perishableRows.map((r, idx) => {
                    const expired = isExpired(r.expiry_date);
                    const expiringSoon = isExpiringSoon(r.expiry_date);
                    const lowStock = (parseFloat(r.qty) || 0) < lowStockThreshold;
                    const materialName = getMaterialName(r.material_id);
                    
                    return (
                      <tr
                        key={idx}
                        style={{
                          ...(expired ? expiredStockStyle : {}),
                          borderLeft: expired ? "3px solid #dc2626" : expiringSoon ? "3px solid #f59e0b" : "none"
                        }}
                      >
                        <td style={tdStyle}>
                          <strong>{r.material_id}</strong>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 500 }}>{materialName}</span>
                        </td>
                        <td style={tdStyle}>{r.location_id}</td>
                        <td style={tdStyle}>{r.batch_id || "-"}</td>
                        <td style={tdStyle}>
                          {formatDate(r.expiry_date)}
                          {expiringSoon && !expired && (
                            <span style={{ marginLeft: "4px", fontSize: "10px", color: "#f59e0b" }}>⚠️</span>
                          )}
                          {expired && (
                            <span style={{ marginLeft: "4px", fontSize: "10px", color: "#dc2626" }}>💀</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={lowStock ? lowStockStyle : normalStockStyle}>
                            {parseFloat(r.qty).toFixed(2)}
                            {lowStock && <span style={{ marginLeft: "4px", fontSize: "10px" }}>⚠️ Low</span>}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {expired ? (
                            <span style={{ color: "#dc2626", fontSize: "11px" }}>Expired</span>
                          ) : expiringSoon ? (
                            <span style={{ color: "#f59e0b", fontSize: "11px" }}>Expiring Soon</span>
                          ) : lowStock ? (
                            <span style={{ color: "#f59e0b", fontSize: "11px" }}>Low Stock</span>
                          ) : (
                            <span style={{ color: "#10b981", fontSize: "11px" }}>Good</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={totalRowStyle}>
                    <td style={tdStyle} colSpan="5">
                      <strong>Total Perishable Stock</strong>
                    </td>
                    <td style={tdStyle} colSpan="2">
                      <strong>{totalPerishableQty.toFixed(2)} units</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Non-Perishable Stock Section */}
            <div style={{ ...sectionHeaderStyle, marginTop: "20px" }}>
              📦 Non-Perishable Stock 
              <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: "normal" }}>
                (Total: {totalNonPerishableQty.toFixed(2)} units)
              </span>
            </div>
            {nonPerishableRows.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#6b7280", padding: "8px" }}>
                No non-perishable stock.
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Material ID</th>
                    <th style={thStyle}>Material Name</th>
                    <th style={thStyle}>Location ID</th>
                    <th style={thStyle}>Batch ID</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nonPerishableRows.map((r, idx) => {
                    const lowStock = (parseFloat(r.qty) || 0) < lowStockThreshold;
                    const materialName = getMaterialName(r.material_id);
                    
                    return (
                      <tr key={idx}>
                        <td style={tdStyle}>
                          <strong>{r.material_id}</strong>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 500 }}>{materialName}</span>
                        </td>
                        <td style={tdStyle}>{r.location_id}</td>
                        <td style={tdStyle}>{r.batch_id || "-"}</td>
                        <td style={tdStyle}>
                          <span style={lowStock ? lowStockStyle : normalStockStyle}>
                            {parseFloat(r.qty).toFixed(2)}
                            {lowStock && <span style={{ marginLeft: "4px", fontSize: "10px" }}>⚠️ Low</span>}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {lowStock ? (
                            <span style={{ color: "#f59e0b", fontSize: "11px" }}>Low Stock</span>
                          ) : (
                            <span style={{ color: "#10b981", fontSize: "11px" }}>In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={totalRowStyle}>
                    <td style={tdStyle} colSpan="4">
                      <strong>Total Non-Perishable Stock</strong>
                    </td>
                    <td style={tdStyle} colSpan="2">
                      <strong>{totalNonPerishableQty.toFixed(2)} units</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Material-wise Summary */}
            <div style={{ ...sectionHeaderStyle, marginTop: "20px" }}>
              📊 Material-wise Summary
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Material ID</th>
                  <th style={thStyle}>Material Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Total Quantity</th>
                  <th style={thStyle}>Batch Count</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...perishableSummary, ...nonPerishableSummary]
                  .sort(sortByMaterialName)
                  .map((summary, idx) => {
                    const isPerishable = perishableSummary.includes(summary);
                    const hasLowStock = summary.lowStockBatches > 0;
                    
                    return (
                      <tr key={idx}>
                        <td style={tdStyle}>
                          <strong>{summary.material_id}</strong>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 500 }}>{summary.material_name}</span>
                        </td>
                        <td style={tdStyle}>
                          {isPerishable ? (
                            <span style={{ color: "#f97316", fontSize: "11px", padding: "2px 6px", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
                              🌡️ Perishable
                            </span>
                          ) : (
                            <span style={{ color: "#6b7280", fontSize: "11px", padding: "2px 6px", backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                              📦 Non-Perishable
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={summary.total_qty < lowStockThreshold ? lowStockStyle : normalStockStyle}>
                            {summary.total_qty.toFixed(2)}
                          </span>
                        </td>
                        <td style={tdStyle}>{summary.batches.length}</td>
                        <td style={tdStyle}>
                          {summary.isExpired ? (
                            <span style={{ color: "#dc2626", fontSize: "11px" }}>💀 Has Expired Stock</span>
                          ) : hasLowStock ? (
                            <span style={{ color: "#f59e0b", fontSize: "11px" }}>⚠️ Low Stock</span>
                          ) : (
                            <span style={{ color: "#10b981", fontSize: "11px" }}>✓ Healthy</span>
                          )}
                         </td>
                       </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr style={totalRowStyle}>
                  <td style={tdStyle} colSpan="3">
                    <strong>Total Materials</strong>
                  </td>
                  <td style={tdStyle} colSpan="3">
                    <strong>{perishableSummary.length + nonPerishableSummary.length} materials</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Legend */}
            <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "4px", fontSize: "11px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "8px" }}>📖 Legend:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                <div>
                  <span style={{ color: "#10b981", fontWeight: "bold" }}>● Good / In Stock</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Normal stock level</span>
                </div>
                <div>
                  <span style={{ color: "#f59e0b", fontWeight: "bold" }}>● Low Stock / Expiring Soon</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Below threshold / Expires within 7 days</span>
                </div>
                <div>
                  <span style={{ color: "#dc2626", fontWeight: "bold" }}>● Expired</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Past expiry date</span>
                </div>
                <div>
                  <span style={{ fontWeight: "bold" }}>⚠️</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Low Stock Alert</span>
                </div>
                <div>
                  <span style={{ fontWeight: "bold" }}>💀</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Expired Stock</span>
                </div>
                <div>
                  <span style={{ fontWeight: "bold" }}>✓</span>
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "#6b7280" }}>- Healthy Stock</span>
                </div>
              </div>
              <div style={{ marginTop: "8px", fontSize: "10px", color: "#6b7280", borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
                Low Stock Threshold: <strong>{lowStockThreshold} units</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}