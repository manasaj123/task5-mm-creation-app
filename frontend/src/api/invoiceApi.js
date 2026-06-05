import axiosClient from "./axiosClient";

const invoiceApi = {
  getAll() {
    return axiosClient.get("/invoices");
  },
  create(data) {
    return axiosClient.post("/invoices", data);
  }
  // later: releaseBlock(id) { return axiosClient.patch(`/invoices/${id}/release-block`); }
};

export default invoiceApi;
