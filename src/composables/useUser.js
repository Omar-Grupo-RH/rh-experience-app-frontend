import UserAPI from "@/api/UserAPI";

export function useUser() {
  const listUsers = async () => {
    const { data } = await UserAPI.index();
    return data ?? [];
  };

  const addUser = async (payload) => {
    const { data } = await UserAPI.store(payload);
    return data ?? [];
  };

  const updateUser = async (payload) => {
    const { data } = await UserAPI.update(payload);
    return data ?? [];
  };

  const deleteUser = async (id) => {
    const { data } = await UserAPI.destroy(id);
    return data ?? [];
  };

  return { listUsers, addUser, deleteUser, updateUser };
}
