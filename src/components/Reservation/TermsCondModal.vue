<script setup>
import { useReservaStore } from "@/stores/public/reservaStore";

const store = useReservaStore();

defineProps({
  isVisible: Boolean,
});

const closeModal = () => {
  store.modal = false;
};
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <Transition name="modal-scale" appear>
        <section
          class="relative flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20"
        >
          <!-- Header -->
          <div class="relative  bg-experience-blue px-6 py-7 text-white sm:px-8">
            

            

            <div class="relative pr-10">
              <span
                class="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white/80 ring-1 ring-white/20"
              >
                RH Experience
              </span>

              <h2 class="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
                Términos y condiciones
              </h2>

              <p class="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                Antes de continuar, lee cuidadosamente la información relacionada
                con tu participación en el recorrido.
              </p>
            </div>
          </div>

          <!-- Body -->
          <div class="custom-scroll flex-1 overflow-y-auto bg-slate-50 px-5 py-6 sm:px-8">
            <div class="mx-auto max-w-3xl space-y-5">
              <div
                class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div class="flex gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-experience-blue/10 text-experience-blue"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 class="text-lg font-black text-slate-900">
                      Participación voluntaria
                    </h3>

                    <p class="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                      Yo manifiesto que es mi voluntad participar en el
                      <strong class="font-black uppercase italic text-slate-900">
                        Recorrido "RH Experience"
                      </strong>
                      a los siguientes municipios y comisarías: Motul de Felipe
                      Carrillo Puerto, Cansahcab, Dzidzantún, Santa Clara y
                      Dzilam del Bravo.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div class="flex gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m0 3.75h.007v.008H12v-.008ZM10.29 3.86 1.82 18a2.25 2.25 0 0 0 1.93 3.375h16.5A2.25 2.25 0 0 0 22.18 18L13.71 3.86a2.25 2.25 0 0 0-3.42 0Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 class="text-lg font-black text-slate-900">
                      Deslinde de responsabilidad
                    </h3>

                    <p class="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                      Declaro bajo protesta de decir verdad que deslindo y libero
                      de toda responsabilidad civil, laboral y penal a
                      <strong class="font-black uppercase text-slate-900">
                        "Desarrollo Inmobiliario Peninsular RH" Sociedad Anónima
                        de Capital Variable, "Inversiones Inmobiliarias R & H
                        del Sureste", Sociedad Anónima de Capital Variable,
                        Creación y Estrategia Inmobiliaria RH Sociedad Anónima de
                        Capital Variable
                      </strong>
                      y todas las empresas pertenecientes a Grupo RH, así como a
                      sus trabajadores, guías, ayudantes, representantes legales o
                      personal de apoyo en el viaje y oficinas, por cualquier
                      accidente, consecuencia o fatalidad que pudiera presentarse
                      durante el
                      <strong class="font-black uppercase italic text-slate-900">
                        Recorrido "RH Experience"
                      </strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div class="flex gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M12 3.75l7.5 3.75v5.25c0 4.142-3.358 7.5-7.5 7.5s-7.5-3.358-7.5-7.5V7.5L12 3.75Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 class="text-lg font-black text-slate-900">
                      Indicaciones y medidas de seguridad
                    </h3>

                    <p class="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                      Hago constar que seguiré las indicaciones, instrucciones y
                      sugerencias de el/la/los guía(s) a cargo del
                      <strong class="font-black uppercase italic text-slate-900">
                        Recorrido "RH Experience"
                      </strong>,
                      así como acatar las medidas de seguridad necesarias. Cuidaré
                      de mi persona y de quienes me rodean para desempeñar las
                      actividades que son de mi conocimiento y para las cuales, de
                      manera voluntaria, consciente y responsable, decidí ser
                      partícipe.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="rounded-3xl border border-dashed border-experience-blue/30 bg-experience-blue/5 p-5 text-center"
              >
                <p class="text-sm leading-7 text-slate-700 sm:text-base">
                  Para los efectos legales que tenga el presente, quedo a sus
                  órdenes.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="border-t border-slate-200 bg-white px-5 py-4 sm:px-8"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="text-xs leading-relaxed text-slate-500 sm:text-sm">
                Al continuar con tu reservación, confirmas que has leído y
                aceptas estos términos.
              </p>

              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-2xl bg-experience-pink px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-experience-pink/30 sm:w-auto"
                @click="closeModal"
              >
                Entendido
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.modal-scale-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>