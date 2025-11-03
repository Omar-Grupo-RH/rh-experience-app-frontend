import AdminAPI from "@/api/AdminAPI";
import TravelsAPI from "@/api/Travels";


export function useTravel() {

  const listTravels = async () => {
    const { data } = await TravelsAPI.allTravels();
    return data.data ?? [];
  };

  const passengersByTravel = async (id) => {
    const { data } = await TravelsAPI.getPassengersByTravel(id);
    return data.data ?? [];
  };

  return { listTravels, passengersByTravel };
}
