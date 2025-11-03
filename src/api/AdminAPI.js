import api from "@/lib/axios";

export default {
  getClientById(id) {
    return api.get("/client", { params: { id } });
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
