import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import { useComments } from "@/composables/useComments";

export const useCommentStore = defineStore("adminComments", () => {
  const { listComments, modifyComment } = useComments();
  const toast = inject("toast");
  const comments = ref([]);

  const hasComments = computed(() => comments.value.length > 0);

  const statusComment = computed(() => (commentId) => {
    const comment = comments.value.find((c) => c.id === commentId);

    return comment.is_visible === "1" ? true : false;
  });

  async function getComments() {
    try {
      const data = await listComments();
      comments.value = data;
    } catch (error) {
      console.log(error);
    }
  }

  async function changeVisibility(comentario) {
    const currentStatus = comentario.is_visible;
    const newStatus = currentStatus === "1" ? "0" : "1";

    const payload = {
      ...comentario,
      is_visible: newStatus,
    };

    const index = comments.value.findIndex((c) => c.id === comentario.id);
    if (index === -1) return;

    const prevComment = { ...comments.value[index] };
    comments.value[index].is_active = newStatus;

    try {
      const { data: updatedComment } = await modifyComment(payload);
      comments.value[index] = updatedComment;
      toast?.open?.({
        message: `El comentario de ${payload.first_name} se actualizo correctamente`,
        type: "success",
      });
    } catch (error) {
      console.log(error);
      comments.value[index] = prevComment;
    }
  }

  return {
    getComments,
    comments,
    hasComments,
    changeVisibility,
    statusComment,
  };
});
