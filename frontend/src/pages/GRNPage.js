import React, { useEffect, useState } from "react";
import grnApi from "../api/grnApi";
import poApi from "../api/poApi";
import vendorApi from "../api/vendorApi";

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
  marginBottom: "8px",
   flexWrap: "wrap"
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

export default function GRNPage() {
  const [poList, setPoList] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  
  const [vendors, setVendors] = useState([]);

  const [header, setHeader] = useState({
    grn_no: "",
    grn_date: "",
    vendor_id: "",
    po_id: "",
    location_id: 1
  });

  const [items, setItems] = useState([]);

  const loadPOs = async () => {
    try {
      const res = await poApi.getAll();
      setPoList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await vendorApi.getAll();
      setVendors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPOs();
    loadVendors();
  }, []);

  const handleSelectPO = async (poId) => {
    setSelectedPoId(poId);
    if (!poId) {
      
      setItems([]);
      return;
    }
    const res = await poApi.getById(poId);
    
    setHeader((h) => ({
      ...h,
      po_id: poId,
      vendor_id: res.data.header.vendor_id
    }));
    setItems(
      (res.data.items || []).map((it) => ({
        po_item_id: it.id,
        material_id: it.material_id,
        received_qty: it.qty,
        accepted_qty: it.qty,
        rejected_qty: 0,
        batch_no: "",
        mfg_date: "",
        expiry_date: "",
        unit_cost: it.price
      }))
    );
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((h) => ({ ...h, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        header,
        items: items.map((it) => ({
          ...it,
          received_qty: Number(it.received_qty),
          accepted_qty: Number(it.accepted_qty),
          rejected_qty: Number(it.rejected_qty),
          unit_cost: Number(it.unit_cost)
        }))
      };
      await grnApi.create(payload);
      alert("GRN saved");
      setHeader({
        grn_no: "",
        grn_date: "",
        vendor_id: "",
        po_id: "",
        location_id: 1
      });
      setItems([]);
      setSelectedPoId("");
      
    } catch (e) {
      console.error(e);
      alert("Error saving GRN");
    }
  };

  return (
    <div>
      <div style={titleStyle}>Goods Receipt (GRN)</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              GRN No
              <input
                style={inputStyle}
                name="grn_no"
                value={header.grn_no}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              GRN Date
              <input
                style={inputStyle}
                type="date"
                name="grn_date"
                value={header.grn_date}
                onChange={handleHeaderChange}
                required
              />
            </label>
            <label style={labelStyle}>
              PO
              <select
                style={inputStyle}
                value={selectedPoId}
                onChange={(e) => handleSelectPO(e.target.value)}
                required
              >
                <option value="">Select PO</option>
                {poList.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_no} - {po.vendor_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Vendor (read-only)
              <select
                style={inputStyle}
                name="vendor_id"
                value={header.vendor_id}
                onChange={handleHeaderChange}
                disabled
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Location Id
              <input
                style={inputStyle}
                type="number"
                name="location_id"
                value={header.location_id}
                onChange={handleHeaderChange}
              />
            </label>
          </div>

          {items.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  margin: "8px 0"
                }}
              >
                GRN Lines
              </div>
              {items.map((it, idx) => (
                <div key={idx} style={formRowStyle}>
                  <label style={labelStyle}>
                    Material ID
                    <input
                      style={inputStyle}
                      value={it.material_id}
                      disabled
                    />
                  </label>
                  <label style={labelStyle}>
                    Received
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.received_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "received_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Accepted
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.accepted_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "accepted_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Rejected
                    <input
                      style={inputStyle}
                      type="number"
                      value={it.rejected_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "rejected_qty", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Batch No
                    <input
                      style={inputStyle}
                      value={it.batch_no}
                      onChange={(e) =>
                        handleItemChange(idx, "batch_no", e.target.value)
                      }
                    />
                  </label> 
                  <label style={labelStyle}>
                    Mfg Date
                    <input
                      style={inputStyle}
                      type="date"
                      value={it.mfg_date}
                      onChange={(e) =>
                        handleItemChange(idx, "mfg_date", e.target.value)
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Expiry Date
                    <input
                      style={inputStyle}
                      type="date"
                      value={it.expiry_date}
                      onChange={(e) =>
                        handleItemChange(idx, "expiry_date", e.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </>
          )}

          <button type="submit" style={buttonStyle} disabled={!items.length}>
            Save GRN
          </button>
        </form>
      </div>
    </div>
  );
}
