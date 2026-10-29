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

  async replace(passengerId, frontFile, backFile) {
    const formData = new FormData();

    formData.append("passenger_id", String(passengerId));
    formData.append("ine_front", frontFile);
    formData.append("ine_back", backFile);

    const { data } = await api.post("/admin/identity/replace", formData, {
      // El navegador/Axios genera el boundary.
      headers: { "Content-Type": undefined },
    });

    return data;
  },

  async getWaiverPdf(passengerId) {
    const response = await api.get("/admin/identity/waiver", {
      params: { passenger_id: passengerId },
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });

    if (!response.data.type.includes("application/pdf")) {
      throw new Error("El servidor no devolvió un PDF válido.");
    }

    return response.data;
  },
  
};
