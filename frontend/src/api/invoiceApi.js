import axiosClient from "./axiosClient";

const invoiceApi = {
  getAll() {
    return axiosClient.get("/invoices");
  },
  create(data) {
    return axiosClient.post("/invoices", data);
  }
};

export default invoiceApi;
