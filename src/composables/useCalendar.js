import AdminAPI from "@/api/AdminAPI";

export function useCalendarAPI() {
  const listEvents = async () => {
    const { data } = await AdminAPI.allTrips();

    return data.data ?? [];
  };

  const getTrip = async (id) => {
    const {
      data: { data },
    } = await AdminAPI.getTripById(id);
    return data ?? null;
  };

  const createEvent = async (payload) => {
    const { data } = await AdminAPI.addTour(payload);
    return data ?? null;
  };
  const updateEvent = async (id, payload) => {
    const { data } = await AdminAPI.update(id, payload);
    return data?.data ?? null;
  };
  const destroyEvent = async (id) => {
    const { data } = await AdminAPI.deleteTrip(id);
    return data ?? false;
  };
  return { listEvents, createEvent, updateEvent, destroyEvent, getTrip };
}
