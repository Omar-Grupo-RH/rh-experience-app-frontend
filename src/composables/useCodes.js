// src/composables/useCodes.js
import CodesAPI from "@/api/CodesAPI";

export function useCodes() {
  const listCodes = async (params = {}) => {
    const { data } = await CodesAPI.allCodes(params);
    return data.data ?? [];
  };

  const showCode = async (id) => {
    const { data } = await CodesAPI.getCode(id);
    return data.data ?? null;
  };

  const storeCode = async (payload) => {
    const { data } = await CodesAPI.addCode(payload);
    return data;
  };

  const modifyCode = async (payload) => {
    const { data } = await CodesAPI.updateCode(payload);
    return data;
  };

  const destroyCode = async (id) => {
    const { data } = await CodesAPI.deleteCode(id);
    return data;
  };

  const validateCode = async (params = {}) => {
    const { data } = await CodesAPI.validateCode(params);
    return data;
  };

  return {
    listCodes,
    showCode,
    storeCode,
    modifyCode,
    destroyCode,
    validateCode,
  };
}
