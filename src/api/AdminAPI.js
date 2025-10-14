import api from "@/lib/axios";

export default {
  allClients() {
    return api.get("/clients");
  },
  getClientById(id) {
    return api.get("/client", { params: { id } });
  },
  addClient(payload) {
    return api.post("/client/create", payload);
  },

  updateClient(payload) {
    return api.post("/client/update", payload);
  },
  deleteClient(id) {
    return api.post("/client/destroy", id);
  },

  allTrips() {
    return api.get("/trips");
  },
  getTripById(id) {
    return api.get("/trip", { params: { id } });
  },
  addTour(payload) {
    return api.post("/trip/create", payload);
  },
  updateTrip(payload) {
    return api.post("/trip/update", payload);
  },
  deleteTrip(id) {
    return api.post("/trip/destroy", { id });
  },
};
