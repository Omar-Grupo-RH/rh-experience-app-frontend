import ReservationAPI from "@/api/ReservationAPI";

export function useReservation() {
  const listEvents = async () => {
    const { data } = await ReservationAPI.allTrips();
    return data.data ?? [];
  };

  const getSeatsByTrip = async (id) => {
    const { data } = await ReservationAPI.getTripById(id);
    return data.data ?? [];
  };

  return {
    listEvents,
    getSeatsByTrip,
  };
}
