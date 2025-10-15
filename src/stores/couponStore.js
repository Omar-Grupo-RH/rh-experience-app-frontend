import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2";
import { useCoupon } from "@/composables/useCoupon";
export const useCouponStore = defineStore("coupons", () => {
  const { listCoupons, storeCoupon, destroyCoupon, showCoupon, modifyCoupon } =
    useCoupon();

  const coupons = ref([]);

  const hasCoupons = computed(() => coupons.value.length > 0);

  const statusCoupon = computed(() => (couponId) => {
    const coupon = coupons.value.find((c) => c.id === couponId);

    return coupon.is_active === "1" ? true : false;
  });

  const isExpiredOrUsedUp = computed(() => (couponId) => {
    const coupon = coupons.value.find((c) => c.id === couponId);
    const today = new Date().toISOString().split("T")[0];

    return coupon.expiry_date < today;
  });

  async function getCoupons() {
    try {
      const data = await listCoupons();
      coupons.value = data;
    } catch (error) {
      console.log(error);
    }
  }

  async function getCouponById(couponId) {
    try {
      const { data } = await showCoupon(couponId);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async function createCoupon(payload) {
    try {
      const { data: newCoupon } = await storeCoupon(payload);
      Swal.fire({
        title: `${newCoupon.code} agregado correctamente`,
        text: "El cupon ha sido registrado.",
        icon: "success",
        timer: 2000,
      });
      coupons.value.push(newCoupon);
    } catch (error) {
      Swal.fire({
        title: error.response.data.error,
        icon: "error",
        timer: 2000,
      });
    }
  }

  async function deleteCoupon(couponId) {
    const prev = [...coupons.value];
    const couponToDelete = coupons.value.find((c) => c.id === couponId);
    if (!couponToDelete) return;
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar a ${couponToDelete.code}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    try {
      await destroyCoupon(couponId);
      Swal.fire({
        title: "Eliminado",
        text: `${couponToDelete.code} eliminado correctamente`,
        icon: "success",
        timer: 2000,
      });
      coupons.value = coupons.value.filter((c) => c.id !== couponId);
    } catch (error) {
      console.error(error);
      coupons.value = prev;
      Swal.fire("Error", "No se pudo eliminar el cupon.", "error");
    }
  }

  async function updateCoupon(payload) {
    try {
      const { data: updatedCoupon } = await modifyCoupon(payload);

      // Actualizar el cupón en el array local
      const index = coupons.value.findIndex((c) => c.id === payload.id);
      if (index !== -1) {
        coupons.value[index] = updatedCoupon;
      }

      Swal.fire({
        title: `${updatedCoupon.code} actualizado correctamente`,
        text: "Los datos del cupón han sido actualizados.",
        icon: "success",
        timer: 2000,
      });

      return updatedCoupon;
    } catch (error) {
      Swal.fire({
        title: error.response.data.error,
        icon: "error",
        timer: 2000,
      });
      throw error;
    }
  }

  async function updateStatus(submitData) {
    const prevStatus = submitData.is_active; // Guardar el estado original
    const newStatusCoupon = prevStatus === "1" ? "0" : "1";

    // Crear el payload con el nuevo estado
    const payload = {
      ...submitData,
      is_active: newStatusCoupon,
    };

    // Actualizar el estado local optimistamente (para que el botón cambie sin esperar respuesta)
    const index = coupons.value.findIndex((c) => c.id === submitData.id);
    if (index === -1) return;

    const prevCoupon = { ...coupons.value[index] }; // respaldo completo
    coupons.value[index].is_active = newStatusCoupon;

    try {
      const { data: updatedCoupon } = await modifyCoupon(payload);
      coupons.value[index] = updatedCoupon; // confirmar el cambio
    } catch (error) {
      console.error(error);

      // Revertir el cambio local al estado original
      coupons.value[index] = prevCoupon;

      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el estado del cupón.",
        icon: "error",
        timer: 2000,
      });
    }
  }


  return {
    coupons,
    isExpiredOrUsedUp,
    hasCoupons,
    createCoupon,
    getCoupons,
    getCouponById,
    statusCoupon,
    deleteCoupon,
    updateCoupon,
    updateStatus,
  };
});
