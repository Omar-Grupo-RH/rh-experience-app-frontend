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
      class="absolute bg-experience-white shadow w-[90%] max-w-4xl h-[600px] p-5 rounded-md overflow-y-scroll top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
    >
      <div class="w-full h-full flex flex-col justify-center relative">
        <button
          class="absolute top-0 right-0 bg-experience-pink text-white font-semibold py-1 px-1.5 rounded-sm cursor-pointer"
          @click="store.modal = !store.modal"
        >
          Cerrar
        </button>
        <h2 class="text-3xl lg:text-5xl text-center">Terminos y condiciones</h2>
        <p class="mt-5">
          Yo manifiesto que es mi voluntad participar en el
          <span class="text-xl uppercase font-semibold italic"
            >Recorrido "RH EXPERIENCE"</span
          >
          a los siguientes municipios y comisarias; Motul de Felipe Carrillo
          Puerto, Cansahcab, Dzidzantun, Santa clara y Dzilam del Bravo.
        </p>

        <p class="mt-5">
          Declaro bajo protesta de decir verdad que, deslindo y libero de toda
          responsabilidad civil, laboral y penal a
          <span class="text-xl uppercase font-semibold"
            >"Desarrollo inmobiliario peninsular RH" Sociedad anonima de capital
            variable, "inversiones inmobiliarias R & H del suereste", sociedad
            anonima de capital variable, creacion y estrategia inmobiliaria rh
            sociedad anonima de capital variable</span
          >
          y todas las empresas pertenecientes a Grupo RH, asi como a sus
          trabajadores, guias, ayudantes, representantes legales, o personal de
          apoyo en el viaje y oficinas por cualquier accidente que tuviera, sus
          consecuencias o fatalidades que puedan presentarse durante el
          <span class="text-xl uppercase font-semibold italic"
            >Recorrido "RH EXPERIENCE"</span
          >.
        </p>

        <p class="mt-5">
          Hago constar que seguire las indicaciones, instrucciones y sugerencias
          de el/la/los guia (s) a cargo del
          <span class="text-xl uppercase font-semibold italic"
            >Recorrido "RH EXPERIENCE"</span
          >, asi como acatar las medidas de seguridad necesarias que cuidare de
          mi persona, asi como de los que me rodean para desempeñar las
          actividades que son de mi conocimiento y para los cuales de manera
          voluntaria, consciente y responsable decidi ser participe.
        </p>

        <p class="mt-5">
          Para los efectos legales que tenga el presente, quedo a sus ordenes.
        </p>
      </div>
    </div>
  </Transition>
</template>


<style scoped>
/* Transiciones para el fade */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

/* Transición adicional para el contenido del modal */
.fade-enter-active .modal-content,
.fade-leave-active .modal-content {
  transition: all 0.3s ease;
}

.fade-enter-from .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

.fade-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}
</style>