import api from "@/lib/axios";

export default {
  allTrips() {
    return api.get("/trips");
  },
};
