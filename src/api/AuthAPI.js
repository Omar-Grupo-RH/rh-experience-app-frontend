import api from "@/lib/axios";

export default {
  register(data) {
    return api.post("/client/create", data);
  },

  login(data) {
    return api.post("/login", data);
  },
  logout() {
    return api.post("/logout");
  },
};
