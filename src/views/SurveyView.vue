<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SurveyAPI from "@/api/SurveyAPI";

const route = useRoute();
const router = useRouter();
const toast = inject("toast");

const loading = ref(false);
const submitting = ref(false);
const alreadyAnswered = ref(false);

const surveyData = ref({
  passenger_name: "",
  email: "",
  trip_title: "",
  trip_date: "",
  ticket_id: "",
  trip_id: "",
});

const answers = reactive({});

const rating10 = Array.from({ length: 10 }, (_, i) => String(i + 1));
const rating5 = Array.from({ length: 5 }, (_, i) => String(i + 1));

const sections = [
  {
    id: "church",
    title: "Parte 1: Iglesia de Dzindzantún",
    description: "En este apartado se califica el tour por la iglesia.",
    note:
      "Si eres de alianza y fue un tour personalizado, esta sección contiene contenido que no se incluyó en el recorrido original.",
    questions: [
      {
        id: "church_experience_rating",
        type: "scale",
        required: true,
        question: "Califica del 1 al 10 la experiencia por la Iglesia",
        options: rating10,
        minLabel: "Malo",
        maxLabel: "Muy bueno",
      },
      {
        id: "church_favorite_part",
        type: "radio",
        required: false,
        question: "¿Cuál fue tu parte favorita de este tour?",
        options: [
          "Murales con azul maya",
          "Campanario y sección de coro para observar el techo (construcción)",
          "Vista de altura (3er piso de la iglesia)",
        ],
      },
      {
        id: "church_guided_tour_rating",
        type: "radio",
        required: false,
        question: "¿Cómo calificas el tour guiado por la iglesia?",
        options: ["Muy bueno", "Bueno", "Regular", "Malo", "Muy Malo"],
      },
      {
        id: "church_suggestion",
        type: "textarea",
        required: false,
        question: "¿Tienes alguna sugerencia?",
        placeholder: "Escribe tu sugerencia...",
      },
    ],
  },
  {
    id: "atv",
    title: "Parte 2: Recorrido en cuatrimotos",
    description:
      "En este apartado se califica el uso de las cuatrimotos en Playar.",
    questions: [
      {
        id: "atv_experience_rating",
        type: "scale",
        required: true,
        question: "Califica del 1 al 10 la experiencia en cuatrimoto",
        options: rating10,
        minLabel: "Muy mala",
        maxLabel: "Muy buena",
      },
      {
        id: "atv_security_rating",
        type: "radio",
        required: true,
        question: "¿Cómo calificarías el tema de seguridad en este recorrido?",
        options: ["Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"],
      },
      {
        id: "atv_driving_easy",
        type: "radio",
        required: true,
        question: "¿Qué tan fácil fue manejar la cuatrimoto/rzer?",
        options: ["Muy fácil", "Fácil", "Regular", "Difícil", "Muy difícil"],
      },
      {
        id: "atv_recommendation",
        type: "textarea",
        required: false,
        question: "¿Alguna recomendación sobre esta experiencia?",
        placeholder: "Escribe tu recomendación...",
      },
    ],
  },
  {
    id: "beach_club",
    title: "Parte 3: Experiencia y percepción del Beach Club",
    description:
      'En esta parte se calificará el espacio para poder visitar "Flamante".',
    questions: [
      {
        id: "beach_general_rating",
        type: "radio",
        required: true,
        question: "¿Cómo te pareció el Beach Club en general?",
        options: ["Excelente", "Regular", "Malo"],
      },
      {
        id: "beach_client_ideal",
        type: "radio",
        required: true,
        question:
          "¿Consideras que, tal como está actualmente, el Beach Club es un espacio ideal para que los clientes lo visiten?",
        options: ["Sí", "Tal vez", "No"],
      },
      {
        id: "beach_recreation_rating",
        type: "scale",
        required: true,
        question:
          "¿Qué tan agradable te parecieron las áreas recreativas y de descanso?",
        options: rating5,
        minLabel: "Malas",
        maxLabel: "Excelentes",
      },
      {
        id: "beach_accessibility_rating",
        type: "radio",
        required: true,
        question: "¿Qué tan accesibles consideraste las instalaciones?",
        options: [
          "Muy accesibles",
          "Accesibles",
          "Poco accesibles",
          "Nada accesible",
        ],
      },
      {
        id: "beach_invite_client",
        type: "radio",
        required: true,
        question:
          "¿Te sentirías cómoda(o) invitando a un cliente, inversionista o turista a visitar este espacio?",
        options: ["Sí", "No"],
      },
      {
        id: "beach_visibility_suggestions",
        type: "textarea",
        required: false,
        question:
          "¿Qué sugerencias específicas harías para mejorar la visibilidad o la presentación del Beach Club?",
        placeholder: "Escribe tus sugerencias...",
      },
    ],
  },
  {
    id: "boat",
    title: "Parte 4: Recorrido en Lancha",
    description:
      "En esta parte se calificará desde la llegada a Dzilam de Bravo, lanchas, cenotes y avistamiento de flora y fauna.",
    questions: [
      {
        id: "boat_trip_feeling",
        type: "radio",
        required: true,
        question: "¿Cómo sentiste el viaje?",
        options: [
          "Muy agradable",
          "Agradable",
          "Regular",
          "Desagradable",
          "Muy desagradable",
        ],
      },
      {
        id: "boat_favorite_part",
        type: "radio",
        required: true,
        question: "¿Cuál fue tu parte favorita de este tour?",
        options: ["Punta arena (Columpios en el mar)", "Cenote"],
      },
      {
        id: "boat_security_rating",
        type: "radio",
        required: true,
        question: "En temas de seguridad, ¿cómo lo calificarías?",
        options: ["Muy seguro", "Seguro", "Regular", "Inseguro", "Muy inseguro"],
      },
      {
        id: "boat_recommendation",
        type: "textarea",
        required: false,
        question: "¿Alguna recomendación sobre esta experiencia?",
        placeholder: "Escribe tu recomendación...",
      },
    ],
  },
  {
    id: "staff",
    title: "Parte 5: Personal",
    description: "¡Califiquemos al personal del RH Experience!",
    questions: [
      {
        id: "staff_before_info_rating",
        type: "scale",
        required: true,
        question: "¿Cómo calificas la información brindada antes del tour?",
        options: rating5,
        minLabel: "Muy deficiente",
        maxLabel: "Excelente",
      },
      {
        id: "staff_andrea_rating",
        type: "scale",
        required: false,
        question:
          "¿Cómo calificas la explicación y acompañamiento de Andrea (Guía RH EXPERIENCE)?",
        options: rating5,
        minLabel: "1",
        maxLabel: "5",
      },
      {
        id: "staff_jaqueline_rating",
        type: "scale",
        required: false,
        question:
          "¿Cómo calificas la explicación y acompañamiento de Jaqueline (Guía RH EXPERIENCE)?",
        options: rating5,
        minLabel: "1",
        maxLabel: "5",
      },
      {
        id: "staff_during_info_rating",
        type: "scale",
        required: true,
        question: "¿Cómo calificas la información brindada durante el tour?",
        options: rating5,
        minLabel: "Muy deficiente",
        maxLabel: "Excelente",
      },
      {
        id: "staff_driver_rating",
        type: "scale",
        required: true,
        question:
          "Respecto a todo el recorrido con la van, ¿el conductor fue atento y manejó bien?",
        options: rating5,
        minLabel: "Definitivamente no",
        maxLabel: "Definitivamente sí",
      },
    ],
  },
  {
    id: "ecotourism",
    title: "Parte 6: Ecoturismo",
    description:
      "En este apartado calificaremos la información brindada en temas socioambientales.",
    questions: [
      {
        id: "eco_environmental_education",
        type: "radio",
        required: true,
        question:
          "¿Consideras que el recorrido enseña temas de educación socioambiental?",
        options: ["Definitivamente sí", "Regular", "Definitivamente no"],
      },
      {
        id: "eco_passport_info",
        type: "radio",
        required: true,
        question:
          '¿El "Pasaporte RH EXPERIENCE" incluye información sociocultural y ambiental?',
        options: ["Sí", "No"],
      },
      {
        id: "eco_kit_rating",
        type: "scale",
        required: true,
        question:
          "Califica el Kit RH Experience (Tote bag, Gorra, Pluma, Stickers y Pasaporte)",
        options: rating5,
        minLabel: "1",
        maxLabel: "5",
      },
      {
        id: "eco_impact_experience",
        type: "textarea",
        required: true,
        question:
          "Comparte un dato curioso o experiencia socioambiental que te haya impactado más:",
        placeholder: "Escribe tu respuesta...",
      },
    ],
  },
  {
    id: "final",
    title: "Sección Final",
    description:
      "En este apartado calificaremos la parte general de todo el recorrido RH Experience.",
    questions: [
      {
        id: "final_general_tour_rating",
        type: "radio",
        required: true,
        question: "¿Qué te pareció el tour en general?",
        options: ["Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"],
      },
      {
        id: "final_general_comment",
        type: "textarea",
        required: true,
        question: "Emite un comentario respecto a tu anterior respuesta:",
        placeholder: "Escribe tu comentario...",
      },
      {
        id: "final_social_comment",
        type: "textarea",
        required: false,
        question:
          "¿Te gustaría dejarnos un comentario final? Esto nos servirá para promocionar el RH EXP en redes sociales :)",
        placeholder: "Escribe tu comentario final...",
      },
    ],
  },
];

const expandedSections = ref(["church"]);

const isSectionExpanded = (sectionId) => {
  return expandedSections.value.includes(sectionId);
};

const toggleSection = (sectionId) => {
  if (expandedSections.value.includes(sectionId)) {
    expandedSections.value = expandedSections.value.filter(
      (id) => id !== sectionId,
    );
    return;
  }

  expandedSections.value.push(sectionId);
};

const requiredQuestions = computed(() => {
  return sections.flatMap((section) => {
    return section.questions.filter((question) => question.required);
  });
});

const answeredRequiredCount = computed(() => {
  return requiredQuestions.value.filter((question) => {
    const value = answers[question.id];

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return Boolean(value);
  }).length;
});

const canSubmit = computed(() => {
  return answeredRequiredCount.value === requiredQuestions.value.length;
});

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getQueryParams = () => ({
  trip_id: route.query.trip_id,
  email: route.query.email,
  ticket_id: route.query.ticket_id,
});

const validateQueryParams = () => {
  const { trip_id, email, ticket_id } = getQueryParams();

  return Boolean(trip_id && email && ticket_id);
};

const loadSurveyData = async () => {
  if (!validateQueryParams()) {
    toast?.open?.({
      message: "El enlace de la encuesta no es válido.",
      type: "error",
    });

    router.replace({ name: "home" });
    return;
  }

  try {
    loading.value = true;

    const { data } = await SurveyAPI.getSurveyData(getQueryParams());

    if (data.already_answered) {
      alreadyAnswered.value = true;
    }

    surveyData.value = data.data;
  } catch (error) {
    toast?.open?.({
      message:
        error?.response?.data?.message ||
        "No se pudo cargar la información de la encuesta.",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!canSubmit.value) {
    toast?.open?.({
      message: "Responde todas las preguntas obligatorias antes de enviar.",
      type: "error",
    });

    return;
  }

  try {
    submitting.value = true;

    const payload = {
      trip_id: Number(route.query.trip_id),
      ticket_id: Number(route.query.ticket_id),
      email: route.query.email,
      answers: { ...answers },
    };

    await SurveyAPI.submitSurvey(payload);

    toast?.open?.({
      message: "Gracias por responder la encuesta.",
      type: "success",
    });

    alreadyAnswered.value = true;
  } catch (error) {
    toast?.open?.({
      message:
        error?.response?.data?.message ||
        "Ocurrió un error al enviar la encuesta.",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadSurveyData();
});
</script>

<template>
  <main class="min-h-dvh bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <section class="mx-auto max-w-4xl">
      <div
        class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
      >
        <div class="bg-experience-blue px-6 py-8 text-white sm:px-8">
          <p
            class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70"
          >
            RH Experience
          </p>

          <h1 class="mt-2 text-3xl font-black sm:text-4xl">
            Cuestionario de retroalimentación
          </h1>

          <p
            class="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base"
          >
            ¡Hola exploradores! Gracias por ser parte de esta aventura. Sus
            opiniones son fundamentales para seguir mejorando y creando
            experiencias inolvidables.
          </p>
        </div>

        <div
          v-if="loading"
          class="flex min-h-[360px] items-center justify-center p-8"
        >
          <div class="flex flex-col items-center gap-3 text-slate-500">
            <div
              class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-experience-blue"
            />
            <p class="text-sm font-medium">Cargando encuesta...</p>
          </div>
        </div>

        <div
          v-else-if="alreadyAnswered"
          class="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"
        >
          <div
            class="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-3xl font-black text-emerald-600 ring-1 ring-emerald-100"
          >
            ✓
          </div>

          <h2 class="text-2xl font-black text-slate-900">
            Gracias por tu respuesta
          </h2>

          <p class="mt-2 max-w-md text-sm text-slate-500">
            Tu encuesta ya fue registrada correctamente.
          </p>
        </div>

        <form
          v-else
          class="space-y-8 p-6 sm:p-8"
          @submit.prevent="handleSubmit"
        >
          <section class="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
            <h2 class="text-lg font-black text-slate-900">
              Datos de tu reservación
            </h2>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-400"
                >
                  Nombre
                </span>
                <input
                  :value="surveyData.passenger_name"
                  readonly
                  class="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />
              </label>

              <label class="block">
                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-400"
                >
                  Correo
                </span>
                <input
                  :value="surveyData.email"
                  readonly
                  class="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />
              </label>

              <label class="block">
                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-400"
                >
                  RH Experience
                </span>
                <input
                  :value="surveyData.trip_title"
                  readonly
                  class="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />
              </label>

              <label class="block">
                <span
                  class="text-xs font-bold uppercase tracking-wide text-slate-400"
                >
                  Fecha de viaje
                </span>
                <input
                  :value="formatDate(surveyData.trip_date)"
                  readonly
                  class="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />
              </label>
            </div>
          </section>

          <section
            v-for="section in sections"
            :key="section.id"
            class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              class="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between"
              @click="toggleSection(section.id)"
            >
              <div>
                <h2 class="text-xl font-black text-slate-900">
                  {{ section.title }}
                </h2>

                <p
                  v-if="section.description"
                  class="mt-2 text-sm leading-relaxed text-slate-500"
                >
                  {{ section.description }}
                </p>

                <p
                  v-if="section.note"
                  class="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-700 ring-1 ring-amber-100"
                >
                  {{ section.note }}
                </p>
              </div>

              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition"
                :class="isSectionExpanded(section.id) ? 'rotate-180' : ''"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="isSectionExpanded(section.id)"
                class="space-y-6 border-t border-slate-100 p-5"
              >
                <article
                  v-for="question in section.questions"
                  :key="question.id"
                  class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100"
                >
                  <h3 class="text-base font-black text-slate-900">
                    {{ question.question }}
                    <span
                      v-if="question.required"
                      class="text-rose-500"
                    >
                      *
                    </span>
                  </h3>

                  <div
                    v-if="question.type === 'scale'"
                    class="mt-4"
                  >
                    <div
                      class="mb-2 flex justify-between text-xs font-semibold text-slate-400"
                    >
                      <span>{{ question.minLabel }}</span>
                      <span>{{ question.maxLabel }}</span>
                    </div>

                    <div class="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      <label
                        v-for="option in question.options"
                        :key="option"
                        class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 transition hover:border-experience-blue hover:bg-experience-blue/5"
                        :class="
                          answers[question.id] === option
                            ? 'border-experience-blue bg-experience-blue/10 text-experience-blue ring-2 ring-experience-blue/10'
                            : ''
                        "
                      >
                        <input
                          v-model="answers[question.id]"
                          type="radio"
                          :name="question.id"
                          :value="option"
                          class="sr-only"
                        />
                        {{ option }}
                      </label>
                    </div>
                  </div>

                  <div
                    v-if="question.type === 'radio'"
                    class="mt-4 grid gap-3 sm:grid-cols-2"
                  >
                    <label
                      v-for="option in question.options"
                      :key="option"
                      class="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-experience-blue hover:bg-experience-blue/5"
                      :class="
                        answers[question.id] === option
                          ? 'border-experience-blue bg-experience-blue/10 ring-2 ring-experience-blue/10'
                          : ''
                      "
                    >
                      <input
                        v-model="answers[question.id]"
                        type="radio"
                        :name="question.id"
                        :value="option"
                        class="h-4 w-4 accent-experience-blue"
                      />
                      <span class="text-sm font-semibold text-slate-700">
                        {{ option }}
                      </span>
                    </label>
                  </div>

                  <textarea
                    v-if="question.type === 'textarea'"
                    v-model="answers[question.id]"
                    rows="4"
                    class="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-experience-blue focus:ring-2 focus:ring-experience-blue/10"
                    :placeholder="
                      question.placeholder || 'Escribe tu respuesta...'
                    "
                  />
                </article>
              </div>
            </Transition>
          </section>

          <div
            class="sticky bottom-4 z-10 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="text-sm text-slate-500">
                Progreso:
                <span class="font-bold text-experience-blue">
                  {{ answeredRequiredCount }}
                </span>
                /
                <span class="font-bold">
                  {{ requiredQuestions.length }}
                </span>
                obligatorias respondidas.
              </p>

              <button
                type="submit"
                class="inline-flex w-full items-center justify-center rounded-2xl bg-experience-blue px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-experience-blue/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                :disabled="!canSubmit || submitting"
              >
                {{ submitting ? "Enviando..." : "Enviar encuesta" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>