import EarningsAPI from "@/api/EarningsAPI";

export function useEarning() {
  const listEarnings = async (date, order) => {
    const { data } = await EarningsAPI.getEarnings(date, order);
    return data.data || { rows: [], summary: null };
  };

  return { listEarnings };
}
