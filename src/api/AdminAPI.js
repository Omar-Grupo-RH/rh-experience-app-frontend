import api from "@/lib/axios";

export default {
  allClients() {
    return api.get("/clients");
  },
};
