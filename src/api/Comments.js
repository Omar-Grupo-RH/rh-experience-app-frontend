import api from "@/lib/axios";

export default {
  allComments() {
    return api.get("/comments");
  },
  newComment(payload) {
    return api.post("/comments/create", payload);
  },
};
