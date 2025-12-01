<script setup>
import { useCommentStore } from "@/stores/public/commentStore";
import { formatDateToSpanish } from "@/utils/formatDate";
import { generarEstrellas } from "@/utils/generateStars";
import { ref, onMounted } from "vue";
import SkeletonComments from "../ui/SkeletonComments.vue";

const commentsStore = useCommentStore();
const loading = ref(true);
const commentPayload = ref({
  letters: "",
  first_name: "",
  last_name: "",
  email: "",
  rating: "",
  comment: "",
});

onMounted(async () => {
  await commentsStore.getComments();
  loading.value = false;
});

const handleSubmit = async (formData) => {
  // Generar iniciales del nombre
  const letterFirstName = formData.first_name.charAt(0);
  const letterLastName = formData.last_name.charAt(0);
  const inicial = letterFirstName + letterLastName;
  const payload = {
    ...formData,
    letters: inicial,
  };

  try {
    await commentsStore.storeComment(payload);
    Object.keys(commentPayload.value).forEach((key) => {
      commentPayload.value[key] = "";
    });
  } catch (error) {
    console.error("Error al enviar el comentario:", error);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto lg:pb-10">
    <h2 class="text-2xl font-semibold lg:text-4xl xl:text-5xl text-center">
      Comparte tu experiencia con nuestra comunidad
    </h2>

    <div
      class="w-full p-5 lg:p-10 bg-white rounded-lg border shadow border-gray-100 my-10"
    >
      <h3 class="text-xl font-semibold mb-5">Deja tu comentario</h3>

      <FormKit
        type="form"
        @submit="handleSubmit"
        id="commentForm"
        :actions="false"
        incomplete-message="No se pudo enviar, revisa las notificaciones"
      >
        <div class="flex flex-col gap-5 lg:flex-row lg:gap-10">
          <div class="flex-1">
            <FormKit
              type="text"
              label="Nombre(s)"
              name="first_name"
              placeholder="Jhon Doe"
              v-model="commentPayload.first_name"
              validation="required|length:3"
              :validation-messages="{ required: 'Tu nombre es obligatorio' }"
            />
          </div>
          <div class="flex-1">
            <FormKit
              type="text"
              label="Apellido(s)"
              name="last_name"
              placeholder="Doe"
              v-model="commentPayload.last_name"
              validation="required|length:3"
              :validation-messages="{ required: 'Tu apellido es obligatorio' }"
            />
          </div>
        </div>
        <div class="flex flex-col gap-5 lg:flex-row lg:gap-10 mt-5">
          <div class="flex-1">
            <FormKit
              type="select"
              label="Calificación"
              name="rating"
              placeholder="Selecciona una calificación"
              v-model="commentPayload.rating"
              validation="required"
              :validation-messages="{
                required: 'La calificación es obligatoria',
              }"
              :options="[
                {
                  value: '',
                  label: 'Selecciona una calificación',
                  attrs: { disabled: true },
                },
                {
                  value: '5',
                  label: '5 ★★★★★ (Excelente)',
                },
                {
                  value: '4',
                  label: '4 ★★★★ (Muy Bueno)',
                },
                {
                  value: '3',
                  label: '3 ★★★ (Bueno)',
                },
                {
                  value: '2',
                  label: '2 ★★ (Regular)',
                },
                {
                  value: '1',
                  label: '1 ★ (Malo)',
                },
              ]"
            />
          </div>
          <div class="flex-1">
            <FormKit
              type="email"
              label="Correo electronico"
              name="email"
              placeholder="johndoe@correo.com"
              v-model="commentPayload.email"
              validation="required|length:3"
              :validation-messages="{
                required: 'Tu email es obligatorio',
              }"
            />
          </div>
        </div>

        <div>
          <FormKit
            type="textarea"
            name="comment"
            label="Comentario"
            placeholder="Escribe tu comentario aquí..."
            v-model="commentPayload.comment"
            validation="required|length:5,100"
            :validation-messages="{
              required: 'Tu comentario es obligatorio',
              length: 'Tu comentario debe tener entre 5 y 100 caracteres.',
            }"
          />
          <div class="text-gray-400 flex justify-end text-sm">
            {{ commentPayload.comment.length }}/100 caracteres
          </div>
        </div>

        <div class="mt-5 lg:flex w-full lg:justify-end">
          <FormKit type="submit">Publicar comentario</FormKit>
        </div>
      </FormKit>
    </div>

    <div v-if="commentsStore.hasComments">
      <div v-if="loading">
        <SkeletonComments :limit="commentsStore.comments.length" />
      </div>
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:mt-5" v-else>
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
          <div class="rating">
            {{ generarEstrellas(comentario.rating) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <h2 class="text-center text-2xl text-gray-400">
        No hay comentarios aun.
      </h2>
    </div>
  </div>
</template>

<style scoped>
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
.comment-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.comment-card:hover::before {
  opacity: 1;
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
