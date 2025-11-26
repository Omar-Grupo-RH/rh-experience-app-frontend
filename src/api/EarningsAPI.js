import api from "@/lib/axios";

export default {
  getEarnings(date, order) {
    return api.get("/earnings", { params: { date, order } });
  },
};
