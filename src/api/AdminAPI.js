import api from "@/lib/axios";

export default {
  allClients() {
    return api.get("/clients");
  },

  addClient(clientData) {
    return api.post("/client/create", clientData);
  },

  deleteClient(id) {
    return api.post("/client/destroy", id);
  },
};
