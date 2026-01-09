import React, { useEffect, useState } from "react";
import invoiceApi from "../api/invoiceApi";
import vendorApi from "../api/vendorApi";
import poApi from "../api/poApi";

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

export default function InvoicePage() {
  const [vendors, setVendors] = useState([]);
  const [pos, setPOs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    invoice_no: "",
    invoice_date: "",
    vendor_id: "",
    po_id: "",
    total_amount: ""
  });

  // line items state
  const [items, setItems] = useState([
    { po_item_id: "", material_id: "", qty: "", price: "", tax_percent: "" }
  ]);

  const loadRefs = async () => {
    try {
      const [vRes, pRes] = await Promise.all([vendorApi.getAll(), poApi.getAll()]);
      setVendors(vRes.data);
      setPOs(pRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getAll();
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    loadInvoices();
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

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { po_item_id: "", material_id: "", qty: "", price: "", tax_percent: "" }
    ]);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header: {
          ...header,
          vendor_id: Number(header.vendor_id),
          po_id: header.po_id ? Number(header.po_id) : null,
          total_amount: Number(header.total_amount)
        },
        items: items
          .filter((it) => it.material_id && it.qty && it.price)
          .map((it) => ({
            ...it,
            po_item_id: it.po_item_id ? Number(it.po_item_id) : null,
            material_id: Number(it.material_id),
            qty: Number(it.qty),
            price: Number(it.price),
            tax_percent: Number(it.tax_percent) || 0
          }))
      };

      await invoiceApi.create(payload);

      setHeader({
        invoice_no: "",
        invoice_date: "",
        vendor_id: "",
        po_id: "",
        total_amount: ""
      });
      setItems([
        { po_item_id: "", material_id: "", qty: "", price: "", tax_percent: "" }
      ]);
      await loadInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Vendor Invoices</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              Invoice No
              <input
                style={inputStyle}
                name="invoice_no"
                value={header.invoice_no}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Invoice Date
              <input
                style={inputStyle}
                type="date"
                name="invoice_date"
                value={header.invoice_date}
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
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              PO (optional)
              <select
                style={inputStyle}
                name="po_id"
                value={header.po_id}
                onChange={handleHeaderChange}
              >
                <option value="">None</option>
                {pos.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_no}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Total Amount
              <input
                style={inputStyle}
                type="number"
                name="total_amount"
                value={header.total_amount}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              margin: "8px 0"
            }}
          >
            Invoice Lines
          </div>

          {items.map((it, idx) => (
            <div key={idx} style={formRowStyle}>
              <label style={labelStyle}>
                PO Item Id
                <input
                  style={inputStyle}
                  value={it.po_item_id}
                  onChange={(e) =>
                    handleItemChange(idx, "po_item_id", e.target.value)
                  }
                  placeholder="Optional link to PO item"
                />
              </label>
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
                Price
                <input
                  style={inputStyle}
                  type="number"
                  value={it.price}
                  onChange={(e) =>
                    handleItemChange(idx, "price", e.target.value)
                  }
                  required
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
              
            </div>
          ))}

          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: "#6b7280",marginRight:"8px" }}
            onClick={addItemRow}
          >
            + Add Line
          </button>

          <button type="submit" style={buttonStyle}>
            Save Invoice
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div
          style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}
        >
          Existing Invoices
        </div>
        {loading ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : invoices.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            No invoices found.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Invoice No</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>PO</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={tdStyle}>{inv.invoice_no}</td>
                  <td style={tdStyle}>{inv.invoice_date}</td>
                  <td style={tdStyle}>{inv.vendor_name}</td>
                  <td style={tdStyle}>{inv.po_no}</td>
                  <td style={tdStyle}>{inv.total_amount}</td>
                  <td style={tdStyle}>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
