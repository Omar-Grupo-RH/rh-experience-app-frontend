import api from "@/lib/axios";

export default {
  allTravels() {
    return api.get("/travels");
  },
  getPassengersByTravel(id) {
    return api.get("/travels/passengers", { params: { id } });
  },
  confirmPassengerPayment(passengerId) {
    return api.post("/passenger-payment", {
      passenger_id: passengerId,
    });
  },
};
