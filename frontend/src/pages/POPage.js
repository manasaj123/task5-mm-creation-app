import React, { useEffect, useState } from "react";
import poApi from "../api/poApi";
import vendorApi from "../api/vendorApi";
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

export default function POPage() {
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    po_no: "",
    po_date: "",
    vendor_id: "",
    payment_terms: "",
    currency: "INR"
  });

  const [items, setItems] = useState([
    { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
  ]);

  const loadRefs = async () => {
    try {
      const [vRes, mRes] = await Promise.all([vendorApi.getAll(), materialApi.getAll()]);
      setVendors(vRes.data);
      setMaterials(mRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPOs = async () => {
    try {
      setLoading(true);
      const res = await poApi.getAll();
      setPOs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    loadPOs();
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
    setItems((prev) => [
      ...prev,
      { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header: {
          ...header,
          vendor_id: Number(header.vendor_id)
        },
        items: items
          .filter((i) => i.material_id && i.qty && i.price)
          .map((i) => ({
            ...i,
            material_id: Number(i.material_id),
            qty: Number(i.qty),
            price: Number(i.price),
            tax_percent: Number(i.tax_percent) || 0
          }))
      };
      await poApi.create(payload);
      setHeader({
        po_no: "",
        po_date: "",
        vendor_id: "",
        payment_terms: "",
        currency: "INR"
      });
      setItems([
        { material_id: "", qty: "", price: "", tax_percent: "", delivery_date: "" }
      ]);
      await loadPOs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Purchase Orders</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              PO No
              <input
                style={inputStyle}
                name="po_no"
                value={header.po_no}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              PO Date
              <input
                style={inputStyle}
                type="date"
                name="po_date"
                value={header.po_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Vendor
              <select
                style={inputStyle}
                name="vendor_id"
                value={header.vendor_id}
                onChange={handleHeaderChange}
                required
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Payment Terms
              <input
                style={inputStyle}
                name="payment_terms"
                value={header.payment_terms}
                onChange={handleHeaderChange}
              />
            </label>
            <label style={labelStyle}>
              Currency
              <input
                style={inputStyle}
                name="currency"
                value={header.currency}
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
                Price
                <input
                  style={inputStyle}
                  type="number"
                  value={it.price}
                  onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                />
              </label>
              <label style={labelStyle}>
                Tax %
                <input
                  style={inputStyle}
                  type="number"
                  value={it.tax_percent}
                  onChange={(e) =>
                    handleItemChange(idx, "tax_percent", e.target.value)
                  }
                />
              </label>
              <label style={labelStyle}>
                Delivery Date
                <input
                  style={inputStyle}
                  type="date"
                  value={it.delivery_date}
                  onChange={(e) =>
                    handleItemChange(idx, "delivery_date", e.target.value)
                  }
                />
              </label>
            </div>
          ))}

          <button type="button" style={{ ...buttonStyle, backgroundColor: "#6b7280",marginRight: "8px" }} onClick={addRow}>
            + Add Row
          </button>

          <button type="submit" style={buttonStyle}>
            Save PO
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>Existing POs</div>
        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : pos.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>No POs found.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PO No</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id}>
                  <td style={tdStyle}>{po.po_no}</td>
                  <td style={tdStyle}>{po.po_date}</td>
                  <td style={tdStyle}>{po.vendor_name}</td>
                  <td style={tdStyle}>{po.status}</td>
                  <td style={tdStyle}>{po.gross_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
