import api from "@/lib/axios";

export default {
  allClients() {
    return api.get("/clients");
  },
  getClientById(id) {
    return api.get("/client", { params: { id } });
  },
  addClient(clientData) {
    return api.post("/client/create", clientData);
  },

  updateClient(payload) {
    return api.post("/client/update", payload);
  },

  deleteClient(id) {
    return api.post("/client/destroy", id);
  },
  
  addTour(tourData) {
    return api.post("/trip/create", tourData);
  }
};
