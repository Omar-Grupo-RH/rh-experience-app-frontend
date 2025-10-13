import AdminAPI from "@/api/AdminAPI";

export function useAdminAPI() {
  async function getAllClients() {
    const {
      data: { data },
    } = await AdminAPI.allClients();
    return data;
  }

  const getClientById = async (id) => {
    const {
      data: { data },
    } = await AdminAPI.getClientById(id);
    return data ?? null;
  };

  const storeClient = async (payload) => {
    const { data } = await AdminAPI.addClient(payload);
    return data?.data ?? null;
  };

  const updateClient = async (payload) => {
    const { data } = await AdminAPI.updateClient(payload);
    return data?.data ?? null;
  };

  const destroyClient = async (id) => {
    const { data } = await AdminAPI.deleteClient({ id });
    return data;
  };


  return {
    getAllClients,
    storeClient,
    destroyClient,
    getClientById,
    updateClient,
    
  };
}
