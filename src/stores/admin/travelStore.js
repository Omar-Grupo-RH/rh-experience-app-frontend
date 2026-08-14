import { useTravel } from "@/composables/useTravel";
import { useReservation } from "@/composables/useReservation";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2";

export const useTravelStore = defineStore(
  "travels",
  () => {
    const { listTravels, passengersByTravel, confirmPassengerPayment } =
      useTravel();
    const {
      updatePassengerInfo,
      reschedulePassengerApi,
      resendPassengerTicketsApi,
      deletePassengerApi,
      updateAttendanceStatusApi,
    } = useReservation();
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

    async function updatePassengerInfoStore(payload) {
      try {
        const data = await updatePassengerInfo(payload);

        if (!data?.success) {
          await Swal.fire({
            title: "No se pudo guardar",
            text:
              data?.message || "Revisa la información e intenta nuevamente.",
            icon: "error",
            confirmButtonColor: "#315fa8",
          });

          return false;
        }

        const updatedPassenger = data?.data ?? payload;

        passengersByTravelArray.value = passengersByTravelArray.value.map(
          (p) => {
            if (Number(p.id) !== Number(updatedPassenger.id)) return p;

            return {
              ...p,
              ...updatedPassenger,
              allergies: JSON.stringify(updatedPassenger.allergies || []),
              health_conditions: JSON.stringify(
                updatedPassenger.health_conditions || [],
              ),
            };
          },
        );

        await Swal.fire({
          title: "Información actualizada",
          text:
            data?.message ||
            "La información del pasajero se ha actualizado correctamente.",
          icon: "success",
          confirmButtonColor: "#315fa8",
          timer: 1800,
          showConfirmButton: false,
        });

        return true;
      } catch (error) {
        console.error(error);

        const backendData = error?.response?.data;

        const backendMessage =
          backendData?.message ||
          "No se pudo actualizar la información del pasajero.";

        const backendErrors = backendData?.errors || null;

        let errorHtml = `<p>${backendMessage}</p>`;

        if (backendErrors && typeof backendErrors === "object") {
          const errorList = Object.values(backendErrors)
            .map((message) => `<li>${message}</li>`)
            .join("");

          errorHtml += `
        <ul style="text-align:center; margin-top:12px;">
          ${errorList}
        </ul>
      `;
        }

        await Swal.fire({
          title: "No se pudo guardar",
          html: errorHtml,
          icon: "error",
          confirmButtonColor: "#315fa8",
        });

        return false;
      }
    }

    async function reschedulePassengerStore(payload) {
      try {
        const response = await reschedulePassengerApi(payload);

        if (!response?.success) {
          await Swal.fire({
            title: "No se pudo reagendar",
            text:
              response?.message ||
              "Revisa la información e intenta nuevamente.",
            icon: "error",
            confirmButtonColor: "#315fa8",
          });

          return false;
        }

        const updatedPassenger = response?.data;

        // Remover el pasajero del array actual (ya está en otro viaje)
        passengersByTravelArray.value = passengersByTravelArray.value.filter(
          (p) => Number(p.id) !== Number(updatedPassenger.id),
        );

        await Swal.fire({
          title: "Pasajero reagendado",
          text: `${updatedPassenger.first_name} ${updatedPassenger.last_name} ha sido reagendado correctamente. Nuevo asiento: ${updatedPassenger.seat_id}`,
          icon: "success",
          confirmButtonColor: "#315fa8",
          timer: 2500,
          showConfirmButton: false,
        });

        return true;
      } catch (error) {
        console.error(error);

        const backendData = error?.response?.data;
        const backendMessage =
          backendData?.message || "No se pudo reagendar al pasajero.";

        await Swal.fire({
          title: "No se pudo reagendar",
          text: backendMessage,
          icon: "error",
          confirmButtonColor: "#315fa8",
        });

        return false;
      }
    }

    async function resendPassengerTicketsStore(passengerId) {
      if (!passengerId) return false;

      const passenger = passengersByTravelArray.value.find(
        (p) => Number(p.id) === Number(passengerId),
      );

      const { isConfirmed } = await Swal.fire({
        title: "Reenviar correo",
        text: passenger?.email
          ? `Se reenviarán los boletos a ${passenger.email}.`
          : "Se reenviarán los boletos al pasajero.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Reenviar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#315fa8",
      });

      if (!isConfirmed) return false;

      Swal.fire({
        title: "Enviando correo",
        text: "Estamos reenviando los boletos al pasajero.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await resendPassengerTicketsApi({
          passenger_id: passengerId,
        });

        if (!response?.success) {
          await Swal.fire({
            title: "No se pudo reenviar",
            text: response?.message || "Intenta nuevamente en unos momentos.",
            icon: "error",
            confirmButtonColor: "#315fa8",
          });

          return false;
        }

        await Swal.fire({
          title: "Correo reenviado",
          text: response.message,
          icon: "success",
          confirmButtonColor: "#315fa8",
          timer: 2500,
          showConfirmButton: false,
        });

        return true;
      } catch (error) {
        console.error(error);

        const backendMessage =
          error?.response?.data?.message ||
          "No se pudo reenviar el correo del pasajero.";

        await Swal.fire({
          title: "No se pudo reenviar",
          text: backendMessage,
          icon: "error",
          confirmButtonColor: "#315fa8",
        });

        return false;
      }
    }

    async function deletePassengerStore(passengerId) {
      if (!passengerId) return false;

      const passenger = passengersByTravelArray.value.find(
        (p) => Number(p.id) === Number(passengerId),
      );

      if (!passenger) {
        await Swal.fire({
          title: "Pasajero no encontrado",
          text: "No se encontró la información del pasajero.",
          icon: "error",
          confirmButtonColor: "#315fa8",
        });
        return false;
      }

      const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar pasajero?",
        text: `Se eliminará a ${passenger.first_name} ${passenger.last_name} y se liberará su asiento.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
      });

      if (!isConfirmed) return false;

      Swal.fire({
        title: "Eliminando pasajero",
        text: "Estamos liberando el asiento.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await deletePassengerApi({
          passenger_id: passengerId,
        });

        if (!response?.success) {
          await Swal.fire({
            title: "No se pudo eliminar",
            text: response?.message || "Intenta nuevamente en unos momentos.",
            icon: "error",
            confirmButtonColor: "#315fa8",
          });
          return false;
        }

        passengersByTravelArray.value = passengersByTravelArray.value.filter(
          (p) => Number(p.id) !== Number(passengerId),
        );

        await Swal.fire({
          title: "Pasajero eliminado",
          text: response.message,
          icon: "success",
          confirmButtonColor: "#315fa8",
          timer: 2200,
          showConfirmButton: false,
        });

        return true;
      } catch (error) {
        console.error(error);

        await Swal.fire({
          title: "No se pudo eliminar",
          text:
            error?.response?.data?.message ||
            "No se pudo eliminar el pasajero.",
          icon: "error",
          confirmButtonColor: "#315fa8",
        });

        return false;
      }
    }

    async function updateAttendanceStatusStore(passengerId, attendanceStatus) {
      if (!passengerId || !attendanceStatus) return false;

      try {
        const response = await updateAttendanceStatusApi({
          passenger_id: passengerId,
          attendance_status: attendanceStatus,
        });

        if (!response?.success) {
          await Swal.fire({
            title: "No se pudo actualizar",
            text: response?.message || "Intenta nuevamente.",
            icon: "error",
            confirmButtonColor: "#315fa8",
          });
          return false;
        }

        passengersByTravelArray.value = passengersByTravelArray.value.map(
          (passenger) =>
            Number(passenger.id) === Number(passengerId)
              ? { ...passenger, attendance_status: attendanceStatus }
              : passenger,
        );

        return true;
      } catch (error) {
        console.error(error);

        await Swal.fire({
          title: "No se pudo actualizar",
          text:
            error?.response?.data?.message ||
            "No se pudo guardar la asistencia del pasajero.",
          icon: "error",
          confirmButtonColor: "#315fa8",
        });

        return false;
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
      updatePassengerInfoStore,
      reschedulePassengerStore,
      resendPassengerTicketsStore,
      deletePassengerStore,
      updateAttendanceStatusStore,

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
