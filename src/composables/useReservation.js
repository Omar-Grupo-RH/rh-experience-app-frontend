import ReservationAPI from "@/api/ReservationAPI";

export function useReservation() {
  const listEvents = async () => {
    const { data } = await ReservationAPI.allTrips();
    return data.data ?? [];
  };

  return {
    listEvents,
  };
}
