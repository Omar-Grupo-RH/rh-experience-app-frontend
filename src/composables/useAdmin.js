import AdminAPI from "@/api/AdminAPI";

export function useAdminAPI() {
  async function getAllClients() {
    const {
      data: { data },
    } = await AdminAPI.allClients();
    return data;
  }

  return {
    getAllClients,
  };
}
