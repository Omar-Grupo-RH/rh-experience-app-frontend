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

  const getPassengerEmail = async (email) => {
    const { data } = await ReservationAPI.passengerByEmail(email);
    return data.data ?? "";
  };

  const updatePassengerInfo = async (payload) => {
    const { data } = await ReservationAPI.updatePassenger(payload);
    return data ?? [];
  };

  const reschedulePassengerApi = async (payload) => {
    const { data } = await ReservationAPI.reschedulePassenger(payload);
    return data ?? null;
  };

  const resendPassengerTicketsApi = async (payload) => {
    const { data } = await ReservationAPI.resendPassengerTickets(payload);
    return data ?? null;
  };

  const deletePassengerApi = async (payload) => {
    const { data } = await ReservationAPI.deletePassenger(payload);
    return data ?? null;
  };

  return {
    listEvents,
    getSeatsByTrip,
    getCouponDiscount,
    setReverse,
    getPassengerEmail,
    updatePassengerInfo,
    reschedulePassengerApi,
    resendPassengerTicketsApi,
    deletePassengerApi,
  };
}
