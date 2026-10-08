import api from "@/lib/axios";

export default {
  getSurveyData(params) {
    return api.get("/survey", { params });
  },

  submitSurvey(payload) {
    return api.post("/survey", payload);
  },

  allResponses(params = {}) {
    return api.get("/admin/survey-responses", { params });
  },

  getResponse(id) {
    return api.get("/admin/survey-response", { params: { id } });
  },

  getStats(params = {}) {
    return api.get("/admin/survey-stats", { params });
  },

  getDeliveries(params = {}) {
    return api.get("/admin/survey-deliveries", { params });
  },

  resendSurvey(payload) {
    return api.post("/survey/resend", payload);
  },
};
