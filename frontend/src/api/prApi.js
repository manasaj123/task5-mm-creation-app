import axiosClient from "./axiosClient";

const prApi = {
  getAll() {
    return axiosClient.get("/pr");
  },
  create(data) {
    return axiosClient.post("/pr", data);
  }
};

export default prApi;
