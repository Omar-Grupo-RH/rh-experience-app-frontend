export const uploadPassengerIdentity = async (
  http,
  { passengerId, front, back },
) => {
  const formData = new FormData();

  formData.append("ticket_passenger_id", String(passengerId));

  formData.append("ine_front", front);
  formData.append("ine_back", back);

  const response = await http.post("/api/passenger/identity/upload", formData);

  return response.data;
};
