<script setup>
import { useCommentStore } from "@/stores/admin/commentStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { generarEstrellas } from "@/utils/generateStars";
import { onMounted } from "vue";

const commentsStore = useCommentStore();

onMounted(async () => {
  await commentsStore.getComments();
});
</script>

<template>
  <div class="mx-auto p-5 space-y-10">
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-4xl font-semibold">Tus Comentarios</h2>
        <p class="text-gray-400">
          Administra los comentarios de tus clientes aqui.
        </p>
      </div>
    </div>

    <div class="rounded-lg bg-white p-5 ">
      <div
        class="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:mt-5 shadow-sm"
        v-if="commentsStore.hasComments"
      >
        <div
          v-for="comentario in commentsStore.comments"
          :key="comentario.id"
          class="comment-card"
        >
          <div class="comment-header">
            <div class="avatar">
              {{ comentario.letters }}
            </div>
            <div class="user-info">
              <h4 class="capitalize">
                {{ comentario.first_name + " " + comentario.last_name }}
              </h4>
              <span>{{ formatDateToSpanish(comentario.created_at) }}</span>
            </div>
          </div>
          <p class="comment-text">{{ comentario.comment }}</p>
          <div class="flex justify-between">
            <div class="rating">
              {{ generarEstrellas(comentario.rating) }}
            </div>
            <button
              class="hover:underline cursor-pointer"
              @click="commentsStore.changeVisibility(comentario)"
            >
              {{
                commentsStore.statusComment(comentario.id)
                  ? "Ocultar"
                  : "Mostrar"
              }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex min-h-[260px] flex-col items-center justify-center border rounded-2xl border-dashed border-slate-300 bg-slate-50  px-6 py-10 text-center"
      >
        <h3 class="text-lg font-bold text-slate-900">
          No hay comentarios registrados.
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          Aquí aparecerán los comentarios de tus clientes una vez que hayan
          participado en un RH EXPERIENCE.
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.comment-card {
  min-width: 300px;
  background: linear-gradient(135deg, #d94a93 0%, #2c5da7 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.user-info h4 {
  margin: 0;
  font-size: 16px;
}

.user-info span {
  font-size: 12px;
  opacity: 0.8;
}

.comment-text {
  font-size: 14px;
  line-height: 1.4;
}

.rating {
  margin-top: 10px;
  color: #ffd700;
  font-size: 18px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-stars {
  color: #ffc107;
  font-size: 1.2rem;
}
</style>
