import api from "@/lib/axios";

export default {
  index() {
    return api.get("/users");
  },

  store(payload) {
    return api.post("/users", payload);
  },

  destroy(id) {
    return api.post("/users/destroy", id);
  },
};
