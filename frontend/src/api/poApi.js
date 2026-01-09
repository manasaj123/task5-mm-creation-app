import axiosClient from "./axiosClient";

const poApi = {
  getAll() {
    return axiosClient.get("/po");
  },
  getById(id) {
    return axiosClient.get(`/po/${id}`);
  },
  create(data) {
    return axiosClient.post("/po", data);
  }
};

export default poApi;
