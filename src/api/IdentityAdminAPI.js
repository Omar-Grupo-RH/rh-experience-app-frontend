import api from "@/lib/axios";

export default {
  async getDocument(passengerId) {
    const { data } = await api.get("/admin/identity", {
      params: {
        passenger_id: passengerId,
      },
    });

    return data.data;
  },

  async getImage(passengerId, side) {
    const response = await api.get("/admin/identity/image", {
      params: {
        passenger_id: passengerId,
        side,
      },
      responseType: "blob",
      headers: {
        Accept: "image/jpeg",
      },
    });

    if (!response.data.type.startsWith("image/")) {
      throw new Error("El servidor no devolvió una imagen válida.");
    }

    return URL.createObjectURL(response.data);
  },

  async verify(passengerId, status) {
    const { data } = await api.post("/admin/identity/verify", {
      passenger_id: passengerId,
      status,
    });

    return data;
  },
};
