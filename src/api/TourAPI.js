import api from "@/lib/axios";

export default {
  reservation(data) {
    return api.post("/tour/create", data);
  },
};
