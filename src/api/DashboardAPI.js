import api from "@/lib/axios";

export default {
  getDashboard(params = {}) {
    return api.get("/admin/dashboard", { params });
  },
};
