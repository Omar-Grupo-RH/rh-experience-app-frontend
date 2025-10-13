import AdminAPI from "@/api/AdminAPI";

export function useCalendarAPI() {
  const listEvents = async () => {
    const { data } = await AdminAPI.list();
    return data?.data ?? []; // asumiendo { success, data }
  };
  const createEvent = async (payload) => {
    const { data } = await AdminAPI.addTour(payload);
    return data ?? null;
  };
  const updateEvent = async (id, payload) => {
    const { data } = await AdminAPI.update(id, payload);
    return data?.data ?? null;
  };
  const removeEvent = async (id) => {
    const { data } = await AdminAPI.remove(id);
    return data?.success ?? false;
  };
  return { listEvents, createEvent, updateEvent, removeEvent };
}
