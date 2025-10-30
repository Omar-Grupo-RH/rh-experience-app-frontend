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

  const getCouponDiscount = async (code) => {
    const { data } = await ReservationAPI.getCoupon(code);
    return data.data ?? [];
  };

  const setReverse = async (payload) => {
    const { data } = await ReservationAPI.reserveTrip(payload);
    
    return data.data ?? [];
  };

  return {
    listEvents,
    getSeatsByTrip,
    getCouponDiscount,
    setReverse,
  };
}
