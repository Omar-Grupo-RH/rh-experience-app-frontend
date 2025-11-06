<script setup>
import { useReservaStore } from "@/stores/public/reservaStore";
const store = useReservaStore();
defineProps({
  isVisible: Boolean,
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-gray-100 shadow w-[90%] max-w-4xl h-[600px] p-5 rounded-md overflow-y-auto relative modal-content"
      >
        <button
          class="absolute top-4 right-4 bg-experience-pink text-white font-semibold py-2 px-3 rounded-sm cursor-pointer z-10 hover:bg-pink-700 transition-colors"
          @click="store.modal = !store.modal"
        >
          Cerrar
        </button>
        
        <div class="w-full h-full flex flex-col justify-center text-justify">
          <h2 class="text-3xl lg:text-5xl text-center font-bold mb-8">Términos y condiciones</h2>
          
          <div class="space-y-5">
            <p>
              Yo manifiesto que es mi voluntad participar en el
              <span class="text-lg uppercase font-semibold italic"
                >Recorrido "RH EXPERIENCE"</span
              >
              a los siguientes municipios y comisarías; Motul de Felipe Carrillo
              Puerto, Cansahcab, Dzidzantun, Santa Clara y Dzilam del Bravo.
            </p>

            <p>
              Declaro bajo protesta de decir verdad que, deslindo y libero de toda
              responsabilidad civil, laboral y penal a
              <span class="text-lg uppercase font-semibold"
                >"Desarrollo inmobiliario peninsular RH" Sociedad anónima de capital
                variable, "inversiones inmobiliarias R & H del sureste", sociedad
                anónima de capital variable, creación y estrategia inmobiliaria RH
                sociedad anónima de capital variable</span
              >
              y todas las empresas pertenecientes a Grupo RH, así como a sus
              trabajadores, guías, ayudantes, representantes legales, o personal de
              apoyo en el viaje y oficinas por cualquier accidente que tuviera, sus
              consecuencias o fatalidades que puedan presentarse durante el
              <span class="text-lg uppercase font-semibold italic"
                >Recorrido "RH EXPERIENCE"</span
              >.
            </p>

            <p>
              Hago constar que seguiré las indicaciones, instrucciones y sugerencias
              de el/la/los guía(s) a cargo del
              <span class="text-lg uppercase font-semibold italic"
                >Recorrido "RH EXPERIENCE"</span
              >, así como acatar las medidas de seguridad necesarias que cuidaré de
              mi persona, así como de los que me rodean para desempeñar las
              actividades que son de mi conocimiento y para los cuales de manera
              voluntaria, consciente y responsable decidí ser partícipe.
            </p>

            <p>
              Para los efectos legales que tenga el presente, quedo a sus órdenes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transiciones para el overlay y el modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transición para el contenido del modal */
.fade-enter-active .modal-content {
  transition: all 0.3s ease;
  transition-delay: 0.1s;
}

.fade-leave-active .modal-content {
  transition: all 0.2s ease;
}

.fade-enter-from .modal-content {
  transform: scale(0.9);
  opacity: 0;
}

.fade-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

/* Personalizar scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>