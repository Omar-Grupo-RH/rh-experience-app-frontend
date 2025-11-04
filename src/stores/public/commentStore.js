import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useComments } from "@/composables/useComments";
import Swal from "sweetalert2";

export const useCommentStore = defineStore("comments", () => {
  const { listComments, createComment } = useComments();

  const comments = ref([]);

  const hasComments = computed(() => comments.value.length > 0);

  async function getComments() {
    try {
      const data = await listComments();
      comments.value = data.filter((c) => c.is_visible == 1);
    } catch (error) {
      console.log(error);
    }
  }

  async function storeComment(payload) {
    try {
      const { data: newComment } = await createComment(payload);
      Swal.fire({
        title: `${newComment.first_name}, tu comentario se publicado correctamente`,
        icon: "success",
        timer: 2000,
      });
      comments.value.push(newComment);
    } catch (error) {
      Swal.fire({
        title: "Hubo un error, intentelo nuevamente.",
        icon: "error",
        timer: 2000,
      });
    }
  }

  return {
    getComments,
    comments,
    hasComments,
    storeComment,
  };
});
