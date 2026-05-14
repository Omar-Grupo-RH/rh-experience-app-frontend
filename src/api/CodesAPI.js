import api from "@/lib/axios";

export default {
  allCodes(params = {}) {
    return api.get("/codes", { params });
  },

  getCode(id) {
    return api.get("/code", { params: { id } });
  },

  addCode(payload) {
    return api.post("/codes", payload);
  },

  updateCode(payload) {
    return api.post("/codes/update", payload);
  },

  deleteCode(id) {
    return api.post("/codes/destroy", { id });
  },

  validateCode(params = {}) {
    return api.get("/codes/validate", { params });
  },
};
