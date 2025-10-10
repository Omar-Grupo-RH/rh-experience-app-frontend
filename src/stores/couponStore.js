import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";

export const useCouponStore = defineStore("coupons", () => {
  const coupons = ref([
    {
      id: "1",
      code: "VERANO2024",
      discount: 20,
      isActive: true,
      expirationDate: "2024-08-31",
      usageCount: 45,
      usageLimit: 100,
      description: "Descuento de verano",
    },
    {
      id: "2",
      code: "PRIMERAVEZ",
      discount: 15,
      isActive: true,
      expirationDate: "2024-12-31",
      usageCount: 128,
      usageLimit: 500,
      description: "Para nuevos clientes",
    },
    {
      id: "3",
      code: "GRUPOGRANDE",
      discount: 25,
      isActive: false,
      expirationDate: "2024-10-15",
      usageCount: 12,
      usageLimit: 50,
      description: "Grupos de 10+ personas",
    },
  ]);

  function createCoupon(coupon) {
    coupons.value.push(coupon);
    Swal.fire("Creado", `Cupon Creado Correctamente.`, "success");
  }

  function updateCoupon(updatedCoupon) {
    const index = coupons.findIndex((c) => c.id === updatedCoupon.id);
    if (index !== -1) {
      coupons[index] = updatedCoupon;
      Swal.fire("Actualizado", `Cupon Modificado Correctamente.`, "success");
    }
  }

  // Eliminar cupon
  function deleteCoupon(coupon) {
    Swal.fire({
      title: `¿Eliminar a ${coupon.code}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        coupons.value = coupons.value.filter((c) => c.id !== coupon.id);
        Swal.fire("Eliminado", `${coupon.code} ha sido eliminado.`, "success");
      }
    });
  }

  return {
    coupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
});
