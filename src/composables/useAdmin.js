import AdminAPI from "@/api/AdminAPI";

export function useAdminAPI() {
  async function getAllClients() {
    const {
      data: { data },
    } = await AdminAPI.allClients();
    return data;
  }

  const addClient = async (payload) => {
    const { data } = await AdminAPI.createClient(payload);
    return data?.data ?? null;
  };

  const destroyClient = async (id) => {
    const { data } = await AdminAPI.deleteClient({ id });
    return data;
  };

  return {
    getAllClients,
    addClient,
    destroyClient,
  };
}
