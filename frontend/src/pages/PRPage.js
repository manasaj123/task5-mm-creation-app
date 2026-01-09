import React, { useEffect, useState } from "react";
import prApi from "../api/prApi";
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

export default function PRPage() {
  const [materials, setMaterials] = useState([]);
  const [prs, setPRs] = useState([]);
  const [header, setHeader] = useState({
    req_no: "",
    req_date: "",
    requester: ""
  });
  const [items, setItems] = useState([
    { material_id: "", qty: "", required_date: "", remarks: "" }
  ]);
  const [loading, setLoading] = useState(false);

  const loadPRs = async () => {
    try {
      setLoading(true);
      const res = await prApi.getAll();
      setPRs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const res = await materialApi.getAll();
      setMaterials(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPRs();
    loadMaterials();
  }, []);

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
    setItems((prev) => [...prev, { material_id: "", qty: "", required_date: "", remarks: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header,
        items: items
          .filter((i) => i.material_id && i.qty)
          .map((i) => ({
            ...i,
            qty: Number(i.qty)
          }))
      };
      await prApi.create(payload);
      setHeader({ req_no: "", req_date: "", requester: "" });
      setItems([{ material_id: "", qty: "", required_date: "", remarks: "" }]);
      await loadPRs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Purchase Requisitions</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              Req No
              <input
                style={inputStyle}
                name="req_no"
                value={header.req_no}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Req Date
              <input
                style={inputStyle}
                type="date"
                name="req_date"
                value={header.req_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Requester
              <input
                style={inputStyle}
                name="requester"
                value={header.requester}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          <div style={{ fontSize: "13px", fontWeight: 500, margin: "8px 0" }}>Items</div>

          {items.map((it, idx) => (
            <div key={idx} style={formRowStyle}>
              <label style={labelStyle}>
                Material
                <select
                  style={inputStyle}
                  value={it.material_id}
                  onChange={(e) => handleItemChange(idx, "material_id", e.target.value)}
                >
                  <option value="">Select</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                Qty
                <input
                  style={inputStyle}
                  type="number"
                  value={it.qty}
                  onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                />
              </label>
              <label style={labelStyle}>
                Required Date
                <input
                  style={inputStyle}
                  type="date"
                  value={it.required_date}
                  onChange={(e) => handleItemChange(idx, "required_date", e.target.value)}
                />
              </label>
              <label style={labelStyle}>
                Remarks
                <input
                  style={inputStyle}
                  value={it.remarks}
                  onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                />
              </label>
            </div>
          ))}

          <button type="button" style={{ ...buttonStyle, backgroundColor: "#6b7280" , marginRight: "8px"}} onClick={addRow}>
            + Add Row
          </button>

          <button type="submit" style={buttonStyle}>
            Save PR
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>Existing PRs</div>
        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : prs.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>No PRs found.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Req No</th>
                <th style={thStyle}>Req Date</th>
                <th style={thStyle}>Requester</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Items</th>
              </tr>
            </thead>
            <tbody>
              {prs.map((pr) => (
                <tr key={pr.id}>
                  <td style={tdStyle}>{pr.req_no}</td>
                  <td style={tdStyle}>{pr.req_date}</td>
                  <td style={tdStyle}>{pr.requester}</td>
                  <td style={tdStyle}>{pr.status}</td>
                  <td style={tdStyle}>{pr.item_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
