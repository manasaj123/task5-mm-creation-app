import React, { useState, useEffect } from "react";
import stockTransferApi from "../api/stockTransferApi";
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

export default function StockTransferPage() {
  const [header, setHeader] = useState({
    from_location_id: "",
    to_location_id: "",
    transfer_date: "",
    ref_no: ""
  });

  const [items, setItems] = useState([
    { material_id: "", batch_id: "", qty: "", unit_cost: "" }
  ]);

  const [stockRows, setStockRows] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [lastTransferFilter, setLastTransferFilter] = useState(null);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((h) => ({ ...h, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { material_id: "", batch_id: "", qty: "", unit_cost: "" }
    ]);
  };

  

  const loadStockSummary = async () => {
    try {
      setLoadingStock(true);
      const res = await stockApi.getSummary();
      setStockRows(res.data);
    } catch (e) {
      console.error("LOAD STOCK ERROR", e);
    } finally {
      setLoadingStock(false);
    }
  };

  // Load stock + saved filter when page first opens
  useEffect(() => {
    loadStockSummary();
    const saved = localStorage.getItem("lastTransferFilter");
    if (saved) {
      try {
        setLastTransferFilter(JSON.parse(saved));
      } catch (e) {
        console.error("PARSE FILTER ERROR", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header: {
          ...header,
          from_location_id: Number(header.from_location_id),
          to_location_id: Number(header.to_location_id)
        },
        items: items
          .filter((it) => it.material_id && it.qty)
          .map((it) => ({
            ...it,
            material_id: Number(it.material_id),
            batch_id: it.batch_id ? Number(it.batch_id) : null,
            qty: Number(it.qty),
            unit_cost: Number(it.unit_cost) || 0
          }))
      };

      await stockTransferApi.create(payload);
      alert("Stock transfer posted");

      const lastFrom = Number(header.from_location_id);
      const lastTo = Number(header.to_location_id);
      const lastMaterial = Number(items[0].material_id);

      setHeader({
        from_location_id: "",
        to_location_id: "",
        transfer_date: "",
        ref_no: ""
      });
      setItems([{ material_id: "", batch_id: "", qty: "", unit_cost: "" }]);

      await loadStockSummary();

      const filter = {
        from_location_id: lastFrom,
        to_location_id: lastTo,
        material_id: lastMaterial
      };
      setLastTransferFilter(filter);
      localStorage.setItem("lastTransferFilter", JSON.stringify(filter));
    } catch (err) {
      console.error("TRANSFER POST ERROR", err);
      alert("Error posting transfer");
    }
  };

  const filteredRows =
    lastTransferFilter && stockRows.length
      ? stockRows.filter(
          (r) =>
            r.material_id === lastTransferFilter.material_id &&
            (r.location_id === lastTransferFilter.from_location_id ||
              r.location_id === lastTransferFilter.to_location_id)
        )
      : stockRows;

  return (
    <div>
      <div style={titleStyle}>Stock Transfer Between Locations</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              From Location Id
              <input
                style={inputStyle}
                name="from_location_id"
                type="number"
                value={header.from_location_id}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              To Location Id
              <input
                style={inputStyle}
                name="to_location_id"
                type="number"
                value={header.to_location_id}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Transfer Date
              <input
                style={inputStyle}
                type="date"
                name="transfer_date"
                value={header.transfer_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Reference No
              <input
                style={inputStyle}
                name="ref_no"
                value={header.ref_no}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          <div
            style={{ fontSize: "13px", fontWeight: 500, margin: "8px 0" }}
          >
            Lines
          </div>

          {items.map((it, idx) => (
            <div key={idx} style={formRowStyle}>
              <label style={labelStyle}>
                Material Id
                <input
                  style={inputStyle}
                  value={it.material_id}
                  onChange={(e) =>
                    handleItemChange(idx, "material_id", e.target.value)
                  }
                  required
                />
              </label>
              <label style={labelStyle}>
                Batch Id (optional)
                <input
                  style={inputStyle}
                  value={it.batch_id}
                  onChange={(e) =>
                    handleItemChange(idx, "batch_id", e.target.value)
                  }
                />
              </label>
              <label style={labelStyle}>
                Qty
                <input
                  style={inputStyle}
                  type="number"
                  value={it.qty}
                  onChange={(e) =>
                    handleItemChange(idx, "qty", e.target.value)
                  }
                  required
                />
              </label>
              <label style={labelStyle}>
                Unit Cost (optional)
                <input
                  style={inputStyle}
                  type="number"
                  value={it.unit_cost}
                  onChange={(e) =>
                    handleItemChange(idx, "unit_cost", e.target.value)
                  }
                />
              </label>
              
            </div>
          ))}

          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: "#6b7280", marginRight:"8px" }}
            onClick={addRow}
          >
            + Add Line
          </button>

          <button type="submit" style={buttonStyle}>
            Post Transfer
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div
          style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}
        >
          Current Stock Summary (Last Transfer)
        </div>
        {loadingStock ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : filteredRows.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            No stock data loaded yet.
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
              {filteredRows.map((r) => {
                const isFrom =
                  lastTransferFilter &&
                  r.location_id === lastTransferFilter.from_location_id;
                const isTo =
                  lastTransferFilter &&
                  r.location_id === lastTransferFilter.to_location_id;

                return (
                  <tr
                    key={
                      r.material_id +
                      "-" +
                      r.location_id +
                      "-" +
                      (r.batch_id || "NB")
                    }
                    style={{
                      backgroundColor: isFrom
                        ? "#fee2e2"
                        : isTo
                        ? "#dcfce7"
                        : "white"
                    }}
                  >
                    <td style={tdStyle}>{r.material_id}</td>
                    <td style={tdStyle}>
                      {r.location_id}
                      {isFrom ? " (From)" : isTo ? " (To)" : ""}
                    </td>
                    <td style={tdStyle}>{r.batch_id || "-"}</td>
                    <td style={tdStyle}>{r.qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
