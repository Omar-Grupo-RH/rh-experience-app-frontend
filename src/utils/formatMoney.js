export const currencyFormat = (quantity) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(quantity);
};
