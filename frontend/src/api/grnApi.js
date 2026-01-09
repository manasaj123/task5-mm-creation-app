import axiosClient from "./axiosClient";

const grnApi = {
  create(data) {
    return axiosClient.post("/grn", data);
  }
};

export default grnApi;
