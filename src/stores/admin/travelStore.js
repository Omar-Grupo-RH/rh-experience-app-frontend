import { useTravel } from "@/composables/useTravel";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2";

export const useTravelStore = defineStore(
  "travels",
  () => {
    const { listTravels, passengersByTravel, confirmPassengerPayment } =
      useTravel();

    const travels = ref([]);
    const passengersByTravelArray = ref([]);
    const travelSelected = ref({});

    const hasTravels = computed(() => travels.value.length > 0);

    const hasPassengersByTravel = computed(
      () => passengersByTravelArray.value.length > 0,
    );

    const quantityPassengers = computed(
      () => passengersByTravelArray.value.length,
    );

    function getTodayDate() {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    function sortTravelsByUpcomingFirst(list = []) {
      const today = getTodayDate();

      return [...list].sort((a, b) => {
        const dateA = a.trip_date;
        const dateB = b.trip_date;

        const aIsPast = dateA < today;
        const bIsPast = dateB < today;

        if (!aIsPast && bIsPast) return -1;

        if (aIsPast && !bIsPast) return 1;

        if (!aIsPast && !bIsPast) {
          return dateA.localeCompare(dateB);
        }

        return dateB.localeCompare(dateA);
      });
    }

    async function getTravels() {
      try {
        const data = await listTravels();

        travels.value = sortTravelsByUpcomingFirst(data);
      } catch (error) {
        console.log(error);
      }
    }

    async function getPassengersByTravel(id) {
      if (!id) {
        return;
      }

      passengersByTravelArray.value = [];
      travelSelected.value = {};

      try {
        const data = await passengersByTravel(id);

        passengersByTravelArray.value = data;
        travelSelected.value = travels.value.filter((t) => t.id == id);
      } catch (error) {
        console.log(error);
      }
    }

    function getPassengerPaymentStatus(id) {
      const passenger = passengersByTravelArray.value.find((p) => p.id == id);

      return passenger?.payment_status || "free";
    }

    function isPassengerFree(id) {
      return getPassengerPaymentStatus(id) === "free";
    }

    function isPassengerPending(id) {
      return getPassengerPaymentStatus(id) === "pending";
    }

    function isPassengerPaid(id) {
      return getPassengerPaymentStatus(id) === "paid";
    }

    function getPassengerPaymentLabel(passenger) {
      const status = passenger?.payment_status || "free";

      if (status === "paid") return "Pagado";
      if (status === "pending") return "Confirmar pago";

      return "Gratis";
    }

    async function tooglePayment(id) {
      if (!id) return;

      const passenger = passengersByTravelArray.value.find((p) => p.id == id);

      if (!passenger) {
        Swal.fire({
          title: "Pasajero no encontrado",
          text: "No se encontró la información del pasajero.",
          icon: "error",
        });

        return;
      }

      if (passenger.payment_status === "free") {
        Swal.fire({
          title: "Boleto gratuito",
          text: "Este pasajero no requiere pago.",
          icon: "info",
          timer: 1800,
          showConfirmButton: false,
        });

        return;
      }

      if (passenger.payment_status === "paid") {
        Swal.fire({
          title: "Pago ya registrado",
          text: "Este pasajero ya fue marcado como pagado.",
          icon: "info",
          timer: 1800,
          showConfirmButton: false,
        });

        return;
      }

      const result = await Swal.fire({
        title: "¿Ya se realizó el pago en efectivo?",
        text: `Verifica correctamente el código del boleto: ${
          passenger.ticket_code || "Sin código"
        }`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#88bf73",
        cancelButtonColor: "#d94a93",
      });

      if (!result.isConfirmed) return;

      try {
        const updatedPayment = await confirmPassengerPayment(id);

        passengersByTravelArray.value = passengersByTravelArray.value.map(
          (p) => {
            if (p.id != id) return p;

            return {
              ...p,
              payment_status: updatedPayment?.payment_status || "paid",
              paid_at: updatedPayment?.paid_at || new Date().toISOString(),
              ticket_code: updatedPayment?.ticket_code || p.ticket_code,
            };
          },
        );

        Swal.fire({
          title: "Pago reflejado",
          text: "El pago se ha reflejado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);

        Swal.fire(
          "Error",
          error?.response?.data?.message ||
            "No se pudo registrar el pago, recarga la página.",
          "error",
        );
      }
    }

    return {
      travels,
      hasTravels,
      getTravels,
      getPassengersByTravel,
      passengersByTravelArray,
      hasPassengersByTravel,
      quantityPassengers,
      travelSelected,
      sortTravelsByUpcomingFirst,

      getPassengerPaymentStatus,
      getPassengerPaymentLabel,
      isPassengerFree,
      isPassengerPending,
      isPassengerPaid,
      tooglePayment,
    };
  },
  {
    persist: true,
  },
);
